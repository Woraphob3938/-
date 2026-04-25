/**
 * ตัวแปลงไฟล์ - รองรับ PDF และรูปภาพ
 * แปลงเป็น PNG, JPG, WEBP, SVG, DOCX ฝั่ง client-side
 */

const QUALITY_MAP = {
  "ต่ำ": 0.3,
  "ปานกลาง": 0.6,
  "สูง": 0.85,
  "ไม่สูญเสียข้อมูล": 1.0,
};

const MIME_MAP = {
  png: "image/png",
  jpg: "image/jpeg",
  webp: "image/webp",
};

let pdfjsLoaded = null;

async function loadPdfJs() {
  if (pdfjsLoaded) return pdfjsLoaded;
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  pdfjsLoaded = pdfjsLib;
  return pdfjsLib;
}

async function ensureImageBlob(file) {
  const name = file.name.toLowerCase();
  if (name.endsWith(".heic") || name.endsWith(".heif")) {
    const heic2any = (await import("heic2any")).default;
    const convertedBlob = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.8 });
    return Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
  }
  return file;
}

async function loadImage(file) {
  const blob = await ensureImageBlob(file);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("ไม่สามารถโหลดรูปภาพได้"));
    img.src = URL.createObjectURL(blob);
  });
}

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + " KB";
  return (bytes / 1024 / 1024).toFixed(1) + " MB";
}

function canvasToBlob(canvas, options) {
  return new Promise((resolve) => {
    const quality = QUALITY_MAP[options.compression] || 0.7;

    if (options.format === "svg") {
      const dataUrl = canvas.toDataURL("image/png");
      const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${canvas.width}" height="${canvas.height}" viewBox="0 0 ${canvas.width} ${canvas.height}">
  <image width="${canvas.width}" height="${canvas.height}" href="${dataUrl}"/>
</svg>`;
      resolve(new Blob([svg], { type: "image/svg+xml" }));
      return;
    }

    const mime = MIME_MAP[options.format] || "image/png";
    canvas.toBlob(
      (blob) => resolve(blob),
      mime,
      options.format === "png" ? undefined : quality,
    );
  });
}

/** ตรวจสอบประเภทไฟล์ */
export function getFileType(file) {
  if (file.type === "application/pdf") return "pdf";
  const name = file.name.toLowerCase();
  if (name.endsWith(".heic") || name.endsWith(".heif")) return "heic";
  if (file.type.startsWith("image/")) return "image";
  return "unknown";
}

/** อ่านข้อมูลไฟล์ (ขนาด, จำนวนหน้า, ความละเอียด) */
export async function getFileInfo(file) {
  const type = getFileType(file);
  const info = {
    type,
    name: file.name,
    size: file.size,
    sizeFormatted: formatFileSize(file.size),
    pages: 1,
    width: 1920,
    height: 1080,
  };

  if (type === "pdf") {
    try {
      const pdfjsLib = await loadPdfJs();
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      info.pages = pdf.numPages;
      const page = await pdf.getPage(1);
      const vp = page.getViewport({ scale: 1 });
      info.width = Math.round(vp.width * 2);
      info.height = Math.round(vp.height * 2);
    } catch (e) {
      console.error("Error reading PDF:", e);
    }
  } else if (type === "image" || type === "heic") {
    try {
      const img = await loadImage(file);
      info.width = img.naturalWidth;
      info.height = img.naturalHeight;
    } catch (e) {
      console.error("Error reading image:", e);
    }
  }

  return info;
}

/** แปลงไฟล์จริง */
export async function convertFile(file, options, onProgress) {
  const type = getFileType(file);
  if (type === "pdf" && options.format === "docx") {
    return convertPDFtoDocx(file, options, onProgress);
  }
  if (type === "pdf") return convertPDF(file, options, onProgress);
  if (type === "image" || type === "heic") {
    if (options.format === "pdf") {
      return convertImageToPDF(file, options, onProgress);
    }
    return convertImage(file, options, onProgress);
  }
  throw new Error("ไม่รองรับประเภทไฟล์นี้");
}

async function convertPDF(file, options, onProgress) {
  const pdfjsLib = await loadPdfJs();
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const results = [];
  const totalPages = pdf.numPages;
  const baseName = file.name.replace(/\.[^/.]+$/, "");

  for (let i = 1; i <= totalPages; i++) {
    const page = await pdf.getPage(i);
    const origVp = page.getViewport({ scale: 1 });

    let targetW = parseInt(options.width) || Math.round(origVp.width * 2);
    let targetH = parseInt(options.height) || Math.round(origVp.height * 2);

    if (options.keepRatio) {
      const ratio = origVp.width / origVp.height;
      targetH = Math.round(targetW / ratio);
    }

    const scale = targetW / origVp.width;
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement("canvas");
    canvas.width = targetW;
    canvas.height = Math.round(viewport.height);
    const ctx = canvas.getContext("2d");

    if (options.format === "jpg") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    await page.render({ canvasContext: ctx, viewport }).promise;

    const blob = await canvasToBlob(canvas, options);
    const pageNum = String(i).padStart(2, "0");

    results.push({
      name: `${baseName}_page_${pageNum}.${options.format}`,
      blob,
      size: blob.size,
      sizeFormatted: formatFileSize(blob.size),
      url: URL.createObjectURL(blob),
      icon: "image",
      tone: ["primary", "secondary", "tertiary"][i % 3],
      meta: `${formatFileSize(blob.size)} • แปลงจาก .pdf`,
    });

    onProgress(Math.round((i / totalPages) * 100));
  }

  return results;
}

/** จัดกลุ่มข้อความตามบรรทัด (ตำแหน่ง Y ใกล้กัน = บรรทัดเดียวกัน) */
function groupTextByLines(items, pageHeight) {
  const mapped = items
    .filter((item) => item.str.trim())
    .map((item) => ({
      str: item.str,
      x: item.transform[4],
      y: pageHeight - item.transform[5],
      fontSize: Math.abs(item.transform[0]),
      fontName: item.fontName || "",
    }))
    .sort((a, b) => a.y - b.y || a.x - b.x);

  if (!mapped.length) return [];

  const lines = [];
  let currentLine = { y: mapped[0].y, items: [mapped[0]] };

  for (let i = 1; i < mapped.length; i++) {
    const item = mapped[i];
    if (Math.abs(item.y - currentLine.y) < item.fontSize * 0.6) {
      currentLine.items.push(item);
    } else {
      lines.push(currentLine);
      currentLine = { y: item.y, items: [item] };
    }
  }
  lines.push(currentLine);

  lines.forEach((line) => line.items.sort((a, b) => a.x - b.x));
  return lines;
}

/** แปลง PDF เป็น DOCX (ดึงข้อความพร้อมรูปแบบ) */
async function convertPDFtoDocx(file, options, onProgress) {
  const pdfjsLib = await loadPdfJs();
  const { Document, Packer, Paragraph, TextRun } = await import("docx");

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const totalPages = pdf.numPages;
  const baseName = file.name.replace(/\.[^/.]+$/, "");

  const sections = [];

  for (let i = 1; i <= totalPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 1 });
    const textContent = await page.getTextContent();
    const lines = groupTextByLines(textContent.items, viewport.height);

    const paragraphs = lines.map((line) => {
      const runs = line.items.map((item) => {
        const isBold =
          item.fontName.toLowerCase().includes("bold") ||
          item.fontName.toLowerCase().includes("heavy");
        const isItalic =
          item.fontName.toLowerCase().includes("italic") ||
          item.fontName.toLowerCase().includes("oblique");
        const fontSize = Math.max(Math.round(item.fontSize), 8);

        return new TextRun({
          text: item.str,
          size: fontSize * 2,
          bold: isBold,
          italics: isItalic,
        });
      });

      return new Paragraph({
        children: runs,
        spacing: { after: 120 },
      });
    });

    if (paragraphs.length === 0) {
      paragraphs.push(new Paragraph({ children: [] }));
    }

    sections.push({
      properties: {
        page: {
          size: {
            width: Math.round(viewport.width * 20),
            height: Math.round(viewport.height * 20),
          },
        },
      },
      children: paragraphs,
    });

    onProgress(Math.round((i / totalPages) * 100));
  }

  const doc = new Document({ sections });
  const rawBlob = await Packer.toBlob(doc);
  const blob = new Blob([rawBlob], {
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });

  return [
    {
      name: `${baseName}.docx`,
      blob,
      size: blob.size,
      sizeFormatted: formatFileSize(blob.size),
      url: URL.createObjectURL(blob),
      icon: "description",
      tone: "primary",
      meta: `${formatFileSize(blob.size)} • แปลงจาก .pdf`,
    },
  ];
}

async function convertImage(file, options, onProgress) {
  const img = await loadImage(file);
  onProgress(20);

  let targetW = parseInt(options.width) || img.naturalWidth;
  let targetH = parseInt(options.height) || img.naturalHeight;

  if (options.keepRatio) {
    const ratio = img.naturalWidth / img.naturalHeight;
    targetH = Math.round(targetW / ratio);
  }

  const canvas = document.createElement("canvas");
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext("2d");

  if (options.format === "jpg") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.drawImage(img, 0, 0, targetW, targetH);
  onProgress(60);

  const blob = await canvasToBlob(canvas, options);
  const baseName = file.name.replace(/\.[^/.]+$/, "");
  const ext = file.name.split(".").pop();
  onProgress(100);

  return [
    {
      name: `${baseName}_converted.${options.format}`,
      blob,
      size: blob.size,
      sizeFormatted: formatFileSize(blob.size),
      url: URL.createObjectURL(blob),
      icon: "image",
      tone: "primary",
      meta: `${formatFileSize(blob.size)} • แปลงจาก .${ext}`,
    },
  ];
}

async function convertImageToPDF(file, options, onProgress) {
  const { jsPDF } = await import("jspdf");
  const img = await loadImage(file);
  onProgress(25);

  let targetW = parseInt(options.width) || img.naturalWidth;
  let targetH = parseInt(options.height) || img.naturalHeight;

  if (options.keepRatio) {
    const ratio = img.naturalWidth / img.naturalHeight;
    targetH = Math.round(targetW / ratio);
  }

  const canvas = document.createElement("canvas");
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, targetW, targetH);
  onProgress(60);

  const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
  onProgress(75);

  const orientation = targetW > targetH ? "landscape" : "portrait";
  const pdf = new jsPDF({ orientation, unit: "px", format: [targetW, targetH] });
  pdf.addImage(dataUrl, "JPEG", 0, 0, targetW, targetH);

  const pdfBlob = pdf.output("blob");
  const baseName = file.name.replace(/\.[^/.]+$/, "");
  const ext = file.name.split(".").pop();
  onProgress(100);

  return [
    {
      name: `${baseName}.pdf`,
      blob: pdfBlob,
      size: pdfBlob.size,
      sizeFormatted: formatFileSize(pdfBlob.size),
      url: URL.createObjectURL(pdfBlob),
      icon: "picture_as_pdf",
      tone: "primary",
      meta: `${formatFileSize(pdfBlob.size)} • แปลงจาก .${ext}`,
    },
  ];
}

/** สร้าง thumbnail preview ของไฟล์ (Data URL) */
export async function generatePreview(file) {
  const type = getFileType(file);
  if (type === "image" || type === "heic") {
    try {
      const blob = await ensureImageBlob(file);
      return URL.createObjectURL(blob);
    } catch (e) {
      console.error("Preview error:", e);
      return null;
    }
  }
  if (type === "pdf") {
    try {
      const pdfjsLib = await loadPdfJs();
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const page = await pdf.getPage(1);
      const origVp = page.getViewport({ scale: 1 });
      const maxW = 600;
      const scale = maxW / origVp.width;
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(viewport.width);
      canvas.height = Math.round(viewport.height);
      const ctx = canvas.getContext("2d");
      await page.render({ canvasContext: ctx, viewport }).promise;
      return canvas.toDataURL("image/png");
    } catch (e) {
      console.error("Preview error:", e);
      return null;
    }
  }
  return null;
}

/** ดาวน์โหลดไฟล์ */
export function downloadFile(fileResult) {
  const forceBlob = new Blob([fileResult.blob], {
    type: "application/octet-stream",
  });
  const url = URL.createObjectURL(forceBlob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileResult.name;
  a.style.display = "none";
  document.body.appendChild(a);
  a.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window }));
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 60000);
}

/** ดาวน์โหลดทั้งหมดเป็น ZIP จริงด้วย JSZip */
export async function downloadAllFilesAsZip(files, zipName = "converted.zip") {
  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();
  files.forEach((f) => zip.file(f.name, f.blob));
  const zipBlob = await zip.generateAsync({ type: "blob", compression: "DEFLATE" });
  const url = URL.createObjectURL(zipBlob);
  const a = document.createElement("a");
  a.href = url;
  a.download = zipName;
  a.style.display = "none";
  document.body.appendChild(a);
  a.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window }));
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 60000);
}

/** ดาวน์โหลดทั้งหมด (fallback สำหรับเดี่ยวไฟล์) */
export function downloadAllFiles(files) {
  if (files.length === 1) {
    downloadFile(files[0]);
  } else {
    downloadAllFilesAsZip(files);
  }
}
