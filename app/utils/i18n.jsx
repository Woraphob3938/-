"use client";

import { createContext, useCallback, useContext, useState } from "react";

/* ─── Dictionary ─── */

const dict = {
  th: {
    // Header & nav
    tools: "เครื่องมือ",

    // Landing
    eyebrow: "Professional file conversion",
    heroTitle: "การแปลงไฟล์ระดับมืออาชีพ",
    heroDesc: "การแปลงไฟล์ที่ปลอดภัย รวดเร็ว และแม่นยำสำหรับเวิร์กโฟลว์ระดับองค์กร วางไฟล์ของคุณด้านล่างเพื่อเริ่มใช้งาน",
    dropTitle: "ลากและวางไฟล์ที่นี่",
    dropCopy: "หรือคลิกเพื่อเลือกจากคอมพิวเตอร์ของคุณ",
    selectFile: "เลือกไฟล์",
    supportedFormats: "รูปแบบที่รองรับ",
    footerCopy: "© 2026 Converto.app. การแปลงไฟล์ระดับมืออาชีพ",
    unsupportedAlert: "ไม่พบไฟล์ที่รองรับ กรุณาเลือกไฟล์ PDF หรือรูปภาพ",

    // Settings
    formatSelection: "การเลือกรูปแบบ",
    configFor: (n) => `กำหนดค่าการแปลงไฟล์สำหรับ ${n} ไฟล์`,
    summaryTitle: "รายละเอียดรวม",
    fileCount: "จำนวนไฟล์",
    filesUnit: "ไฟล์",
    totalSize: "ขนาดรวม",
    pages: (n) => `${n} หน้า`,
    oneFile: "1 ไฟล์",
    outputFormat: "รูปแบบเอาต์พุต",
    required: "จำเป็น",
    qualitySettings: "การตั้งค่าคุณภาพ",
    compressionLevel: "ระดับการบีบอัด",
    compLow: "ต่ำ",
    compMedium: "ปานกลาง",
    compHigh: "สูง",
    compLossless: "ไม่สูญเสียข้อมูล",
    losslessNote: "PNG/SVG ไม่สูญเสียคุณภาพ",
    quality: (p) => `คุณภาพ: ${p}`,
    dimensions: "ขนาด",
    keepAspect: "คงอัตราส่วนกว้างยาว",
    widthPx: "ความกว้าง (px)",
    heightPx: "ความสูง (px)",
    cancel: "ยกเลิก",
    applyConvert: "นำไปใช้และแปลงไฟล์",
    docxInfoTitle: "ข้อมูลการแปลง",
    docxInfoDesc: "ข้อความและรูปแบบตัวอักษร (ตัวหนา, ตัวเอียง, ขนาดฟอนต์) จะถูกดึงจาก PDF และสร้างเป็นไฟล์ Word (.docx) โดยคงรายละเอียดเดิมให้มากที่สุด",

    // Progress
    converting: "กำลังแปลงไฟล์",
    convertingMulti: (n, fmt) => `กำลังแปลง ${n} ไฟล์ เป็น ${fmt}`,
    convertingSingle: (name, fmt) => `กำลังแปลง ${name} เป็น ${fmt}`,
    withCompression: (level) => ` ด้วยการบีบอัดระดับ ${level}`,
    preparing: "กำลังเตรียมไฟล์...",
    convertingFile: (i, total) => `กำลังแปลงไฟล์ ${i}/${total}...`,
    done: "เสร็จสิ้น!",
    errorPrefix: "เกิดข้อผิดพลาด: ",
    stepVerify: "ตรวจสอบไฟล์ต้นฉบับ",
    stepConvert: "กำลังแปลงไฟล์",
    stepOutput: "สร้างไฟล์เอาต์พุต",

    // Download
    filesReady: "ไฟล์ของคุณพร้อมแล้ว!",
    convertSuccess: (n) => `แปลงไฟล์สำเร็จ ${n} ไฟล์ พร้อมสำหรับการดาวน์โหลด`,
    reduced: (p) => `ลด ${p}%`,
    increased: (p) => `เพิ่ม ${p}%`,
    download: "ดาวน์โหลด",
    downloaded: "ดาวน์โหลดแล้ว",
    restart: "เริ่มใหม่",
    downloadAll: "ดาวน์โหลดทั้งหมด",
  },

  en: {
    tools: "Tools",

    eyebrow: "Professional file conversion",
    heroTitle: "Professional File Conversion",
    heroDesc: "Secure, fast, and accurate file conversion for enterprise workflows. Drop your files below to get started.",
    dropTitle: "Drag and drop files here",
    dropCopy: "or click to choose from your computer",
    selectFile: "Select File",
    supportedFormats: "Supported formats",
    footerCopy: "© 2026 Converto.app. Professional file conversion.",
    unsupportedAlert: "No supported files found. Please select PDF or image files.",

    formatSelection: "Format Selection",
    configFor: (n) => `Configure conversion for ${n} file${n > 1 ? "s" : ""}`,
    summaryTitle: "Summary",
    fileCount: "File count",
    filesUnit: (n) => (n > 1 ? "files" : "file"),
    totalSize: "Total size",
    pages: (n) => `${n} page${n > 1 ? "s" : ""}`,
    oneFile: "1 file",
    outputFormat: "Output Format",
    required: "Required",
    qualitySettings: "Quality Settings",
    compressionLevel: "Compression level",
    compLow: "Low",
    compMedium: "Medium",
    compHigh: "High",
    compLossless: "Lossless",
    losslessNote: "PNG/SVG is lossless",
    quality: (p) => `Quality: ${p}`,
    dimensions: "Dimensions",
    keepAspect: "Keep aspect ratio",
    widthPx: "Width (px)",
    heightPx: "Height (px)",
    cancel: "Cancel",
    applyConvert: "Apply & Convert",
    docxInfoTitle: "Conversion Info",
    docxInfoDesc: "Text and formatting (bold, italic, font size) will be extracted from PDF and generated as a Word (.docx) file, preserving details as much as possible.",

    converting: "Converting Files",
    convertingMulti: (n, fmt) => `Converting ${n} files to ${fmt}`,
    convertingSingle: (name, fmt) => `Converting ${name} to ${fmt}`,
    withCompression: (level) => ` with ${level} compression`,
    preparing: "Preparing files...",
    convertingFile: (i, total) => `Converting file ${i}/${total}...`,
    done: "Done!",
    errorPrefix: "Error: ",
    stepVerify: "Verifying source files",
    stepConvert: "Converting files",
    stepOutput: "Generating output",

    filesReady: "Your files are ready!",
    convertSuccess: (n) => `Successfully converted ${n} file${n > 1 ? "s" : ""}. Ready for download.`,
    reduced: (p) => `reduced ${p}%`,
    increased: (p) => `increased ${p}%`,
    download: "Download",
    downloaded: "Downloaded",
    restart: "Start Over",
    downloadAll: "Download All",
  },
};

/* ─── Compression level mapping ─── */

export const compressionKeys = ["compLow", "compMedium", "compHigh", "compLossless"];
export const compressionToInternal = {
  compLow: "ต่ำ",
  compMedium: "ปานกลาง",
  compHigh: "สูง",
  compLossless: "ไม่สูญเสียข้อมูล",
};
export const qualityPercent = {
  compLow: "30%",
  compMedium: "60%",
  compHigh: "85%",
  compLossless: "100%",
};

/* ─── Context ─── */

const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  const [lang, setLang] = useState("th");
  const t = useCallback((key, ...args) => {
    const val = dict[lang]?.[key] ?? dict.th[key] ?? key;
    return typeof val === "function" ? val(...args) : val;
  }, [lang]);

  const toggleLang = useCallback(() => {
    setLang((prev) => (prev === "th" ? "en" : "th"));
  }, []);

  return (
    <I18nContext.Provider value={{ lang, t, toggleLang }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}
