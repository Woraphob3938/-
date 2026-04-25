"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  convertFile,
  downloadAllFilesAsZip,
  downloadFile,
  generatePreview,
  getFileInfo,
  getFileType,
} from "./utils/converter";
import {
  I18nProvider,
  compressionKeys,
  compressionToInternal,
  qualityPercent,
  useI18n,
} from "./utils/i18n";

/* ───────── ค่าคงที่ ───────── */

const supportedFormats = [
  { icon: "picture_as_pdf", label: "PDF" },
  { icon: "image", label: "JPG / PNG" },
  { icon: "description", label: "WEBP" },
  { icon: "table", label: "SVG" },
  { icon: "description", label: "DOCX" },
];

const outputFormats = [
  { value: "png", label: "PNG", icon: "image" },
  { value: "jpg", label: "JPG", icon: "image" },
  { value: "webp", label: "WEBP", icon: "image" },
  { value: "svg", label: "SVG", icon: "polyline" },
  { value: "pdf", label: "PDF", icon: "picture_as_pdf", imageOnly: true },
  { value: "docx", label: "DOCX", icon: "description", pdfOnly: true },
];

/* ───────── คอมโพเนนต์ย่อย ───────── */

function Icon({ children, className = "", fill = false }) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={{ fontVariationSettings: fill ? "'FILL' 1" : "'FILL' 0" }}
      aria-hidden="true"
    >
      {children}
    </span>
  );
}

function LangToggle() {
  const { lang, toggleLang } = useI18n();
  return (
    <button
      className="lang-toggle"
      type="button"
      onClick={toggleLang}
      aria-label="Toggle language"
    >
      <Icon>translate</Icon>
      <span>{lang === "th" ? "EN" : "TH"}</span>
    </button>
  );
}

function Header({ compact = false }) {
  const { t } = useI18n();
  return (
    <header className={`topbar ${compact ? "topbar-compact" : ""}`}>
      <div className="topbar-inner">
        <button className="brand" type="button" aria-label="Converto.app home">
          <span className="brand-mark">
            <Icon fill>change_circle</Icon>
          </span>
          <span>Converto.app</span>
        </button>
        <nav className="nav-links" aria-label="Primary navigation">
          <a href="#tools">{t("tools")}</a>
          <LangToggle />
        </nav>
      </div>
    </header>
  );
}

/* ───── หน้าแรก ───── */

function LandingView({ onUpload }) {
  const { t } = useI18n();
  const inputRef = useRef(null);
  const chooseFile = () => inputRef.current?.click();

  const handleFiles = (fileList) => {
    if (!fileList || fileList.length === 0) return;
    const valid = [];
    for (const file of fileList) {
      if (getFileType(file) !== "unknown") valid.push(file);
    }
    if (valid.length === 0) {
      alert(t("unsupportedAlert"));
      return;
    }
    onUpload(valid);
  };

  return (
    <>
      <Header />
      <main className="landing-shell">
        <section className="hero">
          <p className="eyebrow">{t("eyebrow")}</p>
          <h1>{t("heroTitle")}</h1>
          <p>{t("heroDesc")}</p>
        </section>

        <section className="upload-panel" id="tools" aria-label="Upload file">
          <button
            className="drop-zone"
            type="button"
            onClick={chooseFile}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              handleFiles(e.dataTransfer.files);
            }}
          >
            <span className="drop-icon">
              <Icon>upload_file</Icon>
            </span>
            <span className="drop-title">{t("dropTitle")}</span>
            <span className="drop-copy">{t("dropCopy")}</span>
            <span className="primary-button">{t("selectFile")}</span>
          </button>
          <input
            ref={inputRef}
            className="sr-only"
            type="file"
            accept="application/pdf,image/*"
            multiple
            onChange={(e) => handleFiles(e.target.files)}
          />

          <div className="format-strip">
            <p>{t("supportedFormats")}</p>
            <div>
              {supportedFormats.map((f) => (
                <span className="format-pill" key={f.label}>
                  <Icon>{f.icon}</Icon>
                  {f.label}
                </span>
              ))}
            </div>
          </div>
        </section>
      </main>
      <footer className="footer">
        <strong>Converto.app</strong>
        <span>{t("footerCopy")}</span>
      </footer>
    </>
  );
}

/* ───── หน้าตั้งค่า ───── */

function SettingsView({ files, fileInfos, onBack, onConvert }) {
  const { t } = useI18n();
  const [format, setFormat] = useState("png");
  const [compression, setCompression] = useState("compMedium");
  const [keepRatio, setKeepRatio] = useState(true);
  const [width, setWidth] = useState(fileInfos[0]?.width || 1920);
  const [height, setHeight] = useState(fileInfos[0]?.height || 1080);
  const [previews, setPreviews] = useState([]);
  const firstInfo = fileInfos[0];
  const aspectRatio = firstInfo ? firstInfo.width / firstInfo.height : 1;

  useEffect(() => {
    let cancelled = false;
    Promise.all(files.map((f) => generatePreview(f))).then((urls) => {
      if (!cancelled) setPreviews(urls);
    });
    return () => {
      cancelled = true;
      previews.forEach((u) => { if (u && u.startsWith("blob:")) URL.revokeObjectURL(u); });
    };
  }, [files]);

  const handleWidthChange = (val) => {
    const w = parseInt(val) || 0;
    setWidth(w);
    if (keepRatio && w > 0) setHeight(Math.round(w / aspectRatio));
  };

  const handleHeightChange = (val) => {
    const h = parseInt(val) || 0;
    setHeight(h);
    if (keepRatio && h > 0) setWidth(Math.round(h * aspectRatio));
  };

  const isDocx = format === "docx";
  const hasPdf = fileInfos.some((fi) => fi.type === "pdf");
  const allImage = fileInfos.every((fi) => fi.type === "image");

  const availableFormats = outputFormats.filter(
    (f) => (!f.pdfOnly || hasPdf) && (!f.imageOnly || allImage),
  );

  const handleConvert = () => {
    onConvert({
      format,
      compression: compressionToInternal[compression],
      width,
      height,
      keepRatio,
    });
  };

  return (
    <>
      <Header compact />
      <main className="task-shell">
        <header className="task-header">
          <button className="icon-button" type="button" onClick={onBack} aria-label="Back">
            <Icon>arrow_back</Icon>
          </button>
          <div>
            <h1>{t("formatSelection")}</h1>
            <p>{t("configFor", files.length)}</p>
          </div>
        </header>

        <div className="settings-grid">
          <aside className="file-column">
            <section className="panel file-preview" style={{ maxHeight: 320, overflowY: "auto" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {files.map((f, i) => (
                  <div key={f.name} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div className="document-preview" style={{ width: 64, height: 64, flexShrink: 0 }}>
                      {previews[i] ? (
                        <img
                          src={previews[i]}
                          alt={f.name}
                          style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 4 }}
                        />
                      ) : (
                        <Icon fill>{fileInfos[i]?.type === "pdf" ? "picture_as_pdf" : "image"}</Icon>
                      )}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <h2 style={{ fontSize: 14, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</h2>
                      <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--on-surface-variant)" }}>
                        {fileInfos[i]?.sizeFormatted} • {fileInfos[i]?.pages > 1 ? t("pages", fileInfos[i].pages) : t("oneFile")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
            <section className="panel">
              <h3 className="panel-kicker">{t("summaryTitle")}</h3>
              <dl className="details-list">
                <div>
                  <dt>{t("fileCount")}</dt>
                  <dd>{files.length} {typeof t("filesUnit") === "function" ? t("filesUnit", files.length) : t("filesUnit")}</dd>
                </div>
                <div>
                  <dt>{t("totalSize")}</dt>
                  <dd>{formatFileSize(fileInfos.reduce((s, fi) => s + fi.size, 0))}</dd>
                </div>
              </dl>
            </section>
          </aside>

          <section className="settings-column">
            <div className="panel">
              <div className="panel-heading">
                <h2>{t("outputFormat")}</h2>
                <span className="required-badge">{t("required")}</span>
              </div>
              <div className="format-options">
                {availableFormats.map((item) => {
                  const selected = format === item.value;
                  return (
                    <label className={`format-option ${selected ? "selected" : ""}`} key={item.value}>
                      <input
                        type="radio"
                        name="format"
                        value={item.value}
                        checked={selected}
                        onChange={() => setFormat(item.value)}
                      />
                      <Icon>{item.icon}</Icon>
                      <span>{item.label}</span>
                      {item.pdfOnly ? <span className="format-note">PDF only</span> : null}
                      {selected ? (
                        <span className="check-dot">
                          <Icon fill>check</Icon>
                        </span>
                      ) : null}
                    </label>
                  );
                })}
              </div>
            </div>

            {!isDocx && (
            <div className="panel">
              <div className="panel-heading">
                <h2>{t("qualitySettings")}</h2>
              </div>
              <label className="field-label">{t("compressionLevel")}</label>
              <div className="segmented-control">
                {compressionKeys.map((key) => (
                  <button
                    className={compression === key ? "active" : ""}
                    type="button"
                    key={key}
                    onClick={() => setCompression(key)}
                  >
                    {t(key)}
                  </button>
                ))}
              </div>
              <p className="estimate">
                {format === "png" || format === "svg"
                  ? t("losslessNote")
                  : t("quality", qualityPercent[compression])}
              </p>
            </div>
            )}

            {!isDocx && (
            <div className="panel">
              <div className="panel-heading panel-heading-wrap">
                <h2>{t("dimensions")}</h2>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={keepRatio}
                    onChange={(e) => setKeepRatio(e.target.checked)}
                  />
                  {t("keepAspect")}
                </label>
              </div>
              <div className="dimension-grid">
                <label>
                  <span>{t("widthPx")}</span>
                  <input type="number" value={width} min="1" onChange={(e) => handleWidthChange(e.target.value)} />
                </label>
                <label>
                  <span>{t("heightPx")}</span>
                  <input type="number" value={height} min="1" onChange={(e) => handleHeightChange(e.target.value)} />
                </label>
              </div>
            </div>
            )}

            {isDocx && (
              <div className="panel">
                <div className="panel-heading">
                  <h2>{t("docxInfoTitle")}</h2>
                </div>
                <p style={{ color: "var(--on-surface-variant)", fontSize: 14, lineHeight: 1.6, margin: 0 }}>
                  {t("docxInfoDesc")}
                </p>
              </div>
            )}

            <div className="action-bar">
              <button className="ghost-button" type="button" onClick={onBack}>
                {t("cancel")}
              </button>
              <button className="primary-button action-primary" type="button" onClick={handleConvert}>
                <Icon fill>bolt</Icon>
                {t("applyConvert")}
              </button>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

/* ───── หน้า Progress ───── */

function ProgressView({ files, options, onDone, onError }) {
  const { t } = useI18n();
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState(t("preparing"));
  const [currentFile, setCurrentFile] = useState("");
  const onDoneRef = useRef(onDone);
  const onErrorRef = useRef(onError);
  const hasStarted = useRef(false);

  useEffect(() => {
    onDoneRef.current = onDone;
    onErrorRef.current = onError;
  }, [onDone, onError]);

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    async function run() {
      const allResults = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setCurrentFile(file.name);
        setStatusText(t("convertingFile", i + 1, files.length));
        const offset = (i / files.length) * 100;
        const results = await convertFile(file, options, (p) => {
          setProgress(Math.round(offset + (p / files.length)));
        });
        allResults.push(...results);
      }
      setProgress(100);
      setStatusText(t("done"));
      setTimeout(() => onDoneRef.current(allResults), 500);
    }

    run().catch((err) => {
      console.error("Conversion error:", err);
      setStatusText(t("errorPrefix") + err.message);
      onErrorRef.current?.(err);
    });
  }, [files, options, t]);

  return (
    <>
      <Header compact />
      <main className="center-shell">
        <section className="progress-panel">
          <div className="progress-icon">
            <Icon>sync</Icon>
          </div>
          <h1>{t("converting")}</h1>
          <p>
            {files.length > 1
              ? t("convertingMulti", files.length, options.format.toUpperCase())
              : t("convertingSingle", currentFile || files[0]?.name, options.format.toUpperCase())}
            {options.compression ? t("withCompression", options.compression) : ""}
          </p>
          <div className="progress-meta">
            <span>{progress}%</span>
            <span>{statusText}</span>
          </div>
          <div className="progress-track" aria-label="Conversion progress">
            <div style={{ width: `${progress}%` }} />
          </div>
          <ul className="process-list">
            <li className={progress >= 10 ? "done" : ""}>{t("stepVerify")}</li>
            <li className={progress >= 50 ? "done" : ""}>{t("stepConvert")}</li>
            <li className={progress >= 100 ? "done" : ""}>{t("stepOutput")}</li>
          </ul>
        </section>
      </main>
    </>
  );
}

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + " KB";
  return (bytes / 1024 / 1024).toFixed(1) + " MB";
}

/* ───── หน้าดาวน์โหลด ───── */

function DownloadView({ convertedFiles, originalSize, onRestart }) {
  const { t } = useI18n();
  const [downloaded, setDownloaded] = useState([]);
  const totalOutputSize = convertedFiles.reduce((sum, f) => sum + f.size, 0);
  const savedBytes = Math.max(0, originalSize - totalOutputSize);
  const savedPercent = originalSize > 0 ? Math.round((savedBytes / originalSize) * 100) : 0;
  const grew = totalOutputSize > originalSize;

  const handleDownload = (file) => {
    downloadFile(file);
    setDownloaded((items) => (items.includes(file.name) ? items : [...items, file.name]));
  };

  const handleDownloadAll = async () => {
    if (convertedFiles.length === 1) {
      downloadFile(convertedFiles[0]);
    } else {
      await downloadAllFilesAsZip(convertedFiles);
    }
    setDownloaded(convertedFiles.map((f) => f.name));
  };

  return (
    <>
      <Header compact />
      <main className="center-shell">
        <section className="download-panel">
          <div className="download-heading">
            <span className="success-icon">
              <Icon fill>check_circle</Icon>
            </span>
            <h1>{t("filesReady")}</h1>
            <p>{t("convertSuccess", convertedFiles.length)}</p>
          </div>

          {originalSize > 0 && (
            <div className="size-compare" style={{ marginBottom: 16, padding: 12, borderRadius: 8, background: "var(--surface-1)", textAlign: "center" }}>
              <p style={{ margin: 0, fontSize: 14, color: "var(--on-surface-variant)" }}>
                {formatFileSize(originalSize)} → {formatFileSize(totalOutputSize)}
                {originalSize > 0
                  ? ` (${grew ? t("increased", Math.abs(savedPercent)) : t("reduced", Math.abs(savedPercent))})`
                  : ""}
              </p>
            </div>
          )}

          <ul className="download-list">
            {convertedFiles.map((file) => {
              const isDownloaded = downloaded.includes(file.name);
              return (
                <li key={file.name}>
                  <div className="file-row-main">
                    <span className={`file-icon ${file.tone}`}>
                      <Icon fill>{file.icon}</Icon>
                    </span>
                    <div>
                      <strong>{file.name}</strong>
                      <span>{file.meta}</span>
                    </div>
                  </div>
                  <button
                    className={isDownloaded ? "download-button downloaded" : "download-button"}
                    type="button"
                    onClick={() => handleDownload(file)}
                  >
                    <Icon>{isDownloaded ? "done" : "download"}</Icon>
                    {isDownloaded ? t("downloaded") : t("download")}
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="download-actions">
            <button className="secondary-button" type="button" onClick={onRestart}>
              <Icon>refresh</Icon>
              {t("restart")}
            </button>
            <button className="primary-button action-primary" type="button" onClick={handleDownloadAll}>
              <Icon>folder_zip</Icon>
              {t("downloadAll")}
            </button>
          </div>
        </section>
      </main>
    </>
  );
}

/* ───── หน้าหลัก ───── */

function AppContent() {
  const [step, setStep] = useState("landing");
  const [files, setFiles] = useState([]);
  const [fileInfos, setFileInfos] = useState([]);
  const [options, setOptions] = useState(null);
  const [convertedFiles, setConvertedFiles] = useState([]);

  const handleUpload = useCallback(async (rawFiles) => {
    const infos = await Promise.all(rawFiles.map((f) => getFileInfo(f)));
    setFiles(rawFiles);
    setFileInfos(infos);
    setStep("settings");
  }, []);

  const handleConvert = useCallback((opts) => {
    setOptions(opts);
    setStep("progress");
  }, []);

  const handleDone = useCallback((results) => {
    setConvertedFiles(results);
    setStep("download");
  }, []);

  const originalSize = files.reduce((s, f) => s + (f?.size || 0), 0);

  const handleRestart = useCallback(() => {
    convertedFiles.forEach((f) => { if (f.url) URL.revokeObjectURL(f.url); });
    setStep("landing");
    setFiles([]);
    setFileInfos([]);
    setOptions(null);
    setConvertedFiles([]);
  }, [convertedFiles]);

  if (step === "settings" && files.length > 0 && fileInfos.length > 0) {
    return <SettingsView files={files} fileInfos={fileInfos} onBack={() => setStep("landing")} onConvert={handleConvert} />;
  }
  if (step === "progress" && files.length > 0 && options) {
    return <ProgressView files={files} options={options} onDone={handleDone} onError={() => setStep("settings")} />;
  }
  if (step === "download" && convertedFiles.length > 0) {
    return <DownloadView convertedFiles={convertedFiles} originalSize={originalSize} onRestart={handleRestart} />;
  }
  return <LandingView onUpload={handleUpload} />;
}

export default function Home() {
  return (
    <I18nProvider>
      <AppContent />
    </I18nProvider>
  );
}
