"use client";

import { FormEvent, useMemo, useState } from "react";
import { avatars, languages, type MarketingLanguage } from "@/lib/video";

type GenerationState =
  | "idle"
  | "creating"
  | "processing"
  | "done"
  | "error";

type GenerateResponse = {
  id?: string;
  status?: string;
  script?: string;
  error?: string;
  details?: unknown;
};

type StatusResponse = {
  status?: string;
  resultUrl?: string | null;
  error?: string;
  details?: unknown;
};

const languageEntries = Object.entries(languages) as Array<
  [MarketingLanguage, (typeof languages)[MarketingLanguage]]
>;

function delay(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function getErrorMessage(payload: { error?: string; details?: unknown }) {
  if (payload.error) {
    return payload.error;
  }

  if (payload.details) {
    return JSON.stringify(payload.details);
  }

  return "حدث خطأ غير متوقع أثناء توليد الفيديو.";
}

export default function Home() {
  const [selectedAvatarId, setSelectedAvatarId] = useState(avatars[0].id);
  const [language, setLanguage] = useState<MarketingLanguage>("moroccan");
  const [description, setDescription] = useState("");
  const [productImageName, setProductImageName] = useState("");
  const [productPreview, setProductPreview] = useState<string | null>(null);
  const [generationState, setGenerationState] =
    useState<GenerationState>("idle");
  const [videoId, setVideoId] = useState("");
  const [resultUrl, setResultUrl] = useState("");
  const [script, setScript] = useState("");
  const [error, setError] = useState("");

  const selectedAvatar = useMemo(
    () =>
      avatars.find((avatar) => avatar.id === selectedAvatarId) ?? avatars[0],
    [selectedAvatarId],
  );

  async function pollVideoStatus(id: string) {
    for (let attempt = 0; attempt < 45; attempt += 1) {
      await delay(attempt < 8 ? 2500 : 5000);

      const response = await fetch(`/api/video-status/${id}`, {
        cache: "no-store",
      });
      const payload = (await response.json()) as StatusResponse;

      if (!response.ok) {
        throw new Error(getErrorMessage(payload));
      }

      if (payload.status === "done" && payload.resultUrl) {
        setResultUrl(payload.resultUrl);
        setGenerationState("done");
        return;
      }

      if (payload.status === "error" || payload.status === "rejected") {
        throw new Error("تعذر إكمال الفيديو من مزود D-ID.");
      }
    }

    throw new Error(
      "الفيديو ما زال قيد المعالجة. جرّب التحقق لاحقًا من لوحة D-ID.",
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setResultUrl("");
    setVideoId("");

    if (!productPreview) {
      setGenerationState("error");
      setError("يرجى رفع صورة المنتج قبل توليد الفيديو.");
      return;
    }

    if (description.trim().length < 12) {
      setGenerationState("error");
      setError("اكتب وصفًا أوضح للمنتج، لا يقل عن 12 حرفًا.");
      return;
    }

    try {
      setGenerationState("creating");

      const response = await fetch("/api/generate-video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          avatarId: selectedAvatarId,
          description,
          language,
          productImageName,
        }),
      });
      const payload = (await response.json()) as GenerateResponse;

      if (!response.ok || !payload.id) {
        throw new Error(getErrorMessage(payload));
      }

      setVideoId(payload.id);
      setScript(payload.script ?? "");
      setGenerationState("processing");
      await pollVideoStatus(payload.id);
    } catch (caughtError) {
      setGenerationState("error");
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "حدث خطأ غير متوقع أثناء توليد الفيديو.",
      );
    }
  }

  function handleProductImage(file: File | undefined) {
    if (!file) {
      return;
    }

    setProductImageName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setProductPreview(typeof reader.result === "string" ? reader.result : "");
    };
    reader.readAsDataURL(file);
  }

  const isBusy = generationState === "creating" || generationState === "processing";

  return (
    <main className="min-h-screen overflow-hidden bg-black text-white">
      <section className="hero-shell">
        <div className="glow glow-one" />
        <div className="glow glow-two" />

        <nav className="topbar" aria-label="Main navigation">
          <div className="brand">
            <span className="brand-mark">AI</span>
            <span>Video Studio</span>
          </div>
          <div className="nav-pill">Powered by D-ID API</div>
        </nav>

        <div className="hero-grid">
          <section className="hero-copy">
            <div className="eyebrow">أداة تسويق بالفيديو بالذكاء الاصطناعي</div>
            <h1>
              أنشئ فيديوهات تسويقية احترافية بأفاتار يتكلم عن منتجك خلال دقائق.
            </h1>
            <p>
              اختر الشخصية، ارفع صورة المنتج، اكتب الوصف، وحدد لغة الخطاب.
              الأداة تولد نصًا تسويقيًا وترسله إلى D-ID لإنشاء فيديو أفاتار
              جاهز للمعاينة والتحميل.
            </p>

            <div className="stats-row" aria-label="Tool highlights">
              <div>
                <strong>4</strong>
                <span>لغات ولهجات</span>
              </div>
              <div>
                <strong>HD</strong>
                <span>معاينة مباشرة</span>
              </div>
              <div>
                <strong>API</strong>
                <span>تكامل آمن</span>
              </div>
            </div>
          </section>

          <section className="studio-card" aria-label="AI video generator">
            <form onSubmit={handleSubmit} className="generator-form">
              <div className="section-heading">
                <span>01</span>
                <div>
                  <h2>اختيار الأفاتار</h2>
                  <p>اختر الشخصية الأنسب لصوت علامتك التجارية.</p>
                </div>
              </div>

              <div className="avatar-grid">
                {avatars.map((avatar) => (
                  <label
                    className={`avatar-card ${
                      selectedAvatarId === avatar.id ? "is-selected" : ""
                    }`}
                    key={avatar.id}
                  >
                    <input
                      type="radio"
                      name="avatar"
                      value={avatar.id}
                      checked={selectedAvatarId === avatar.id}
                      onChange={() => setSelectedAvatarId(avatar.id)}
                    />
                    <img src={avatar.imageUrl} alt={avatar.name} />
                    <span>{avatar.name}</span>
                    <small>{avatar.title}</small>
                  </label>
                ))}
              </div>

              <div className="form-columns">
                <div className="form-panel">
                  <div className="section-heading compact">
                    <span>02</span>
                    <div>
                      <h2>صورة المنتج</h2>
                      <p>ارفع صورة المنتج للمعاينة داخل المشروع.</p>
                    </div>
                  </div>
                  <label className="upload-box">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(event) =>
                        handleProductImage(event.target.files?.[0])
                      }
                    />
                    {productPreview ? (
                      <img src={productPreview} alt="Product preview" />
                    ) : (
                      <span>
                        اسحب الصورة هنا أو اضغط للرفع
                        <small>PNG, JPG, WEBP</small>
                      </span>
                    )}
                  </label>
                  {productImageName ? (
                    <p className="file-name">{productImageName}</p>
                  ) : null}
                </div>

                <div className="form-panel">
                  <div className="section-heading compact">
                    <span>03</span>
                    <div>
                      <h2>لغة الفيديو</h2>
                      <p>اختر نبرة الخطاب المناسبة للجمهور.</p>
                    </div>
                  </div>
                  <div className="language-grid">
                    {languageEntries.map(([key, item]) => (
                      <label
                        className={`language-card ${
                          language === key ? "is-selected" : ""
                        }`}
                        key={key}
                      >
                        <input
                          type="radio"
                          name="language"
                          value={key}
                          checked={language === key}
                          onChange={() => setLanguage(key)}
                        />
                        <strong>{item.label}</strong>
                        <small>{item.helper}</small>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <label className="description-field">
                <span>04 · وصف المنتج</span>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="مثال: عطر فاخر يدوم طويلًا برائحة شرقية عصرية، مناسب للهدايا والمناسبات..."
                  rows={5}
                />
              </label>

              <button className="generate-button" disabled={isBusy}>
                {generationState === "creating"
                  ? "جاري إرسال الطلب..."
                  : generationState === "processing"
                    ? "جاري توليد الفيديو..."
                    : "توليد الفيديو"}
              </button>
            </form>
          </section>
        </div>
      </section>

      <section className="preview-section">
        <div className="preview-card">
          <div className="preview-meta">
            <span className="section-number">05</span>
            <div>
              <h2>معاينة وتحميل الفيديو الناتج</h2>
              <p>
                سيظهر الفيديو هنا عند انتهاء D-ID من المعالجة. يمكنك تشغيله أو
                تحميله مباشرة من الرابط الناتج.
              </p>
            </div>
          </div>

          <div className="preview-grid">
            <div className="result-stage">
              {resultUrl ? (
                <video src={resultUrl} controls playsInline />
              ) : (
                <div className="empty-preview">
                  <img src={selectedAvatar.imageUrl} alt={selectedAvatar.name} />
                  <div>
                    <strong>{selectedAvatar.name}</strong>
                    <span>{selectedAvatar.mood}</span>
                  </div>
                </div>
              )}
            </div>

            <aside className="status-panel">
              <div className={`status-badge ${generationState}`}>
                {generationState === "idle" && "جاهز للتوليد"}
                {generationState === "creating" && "إنشاء الطلب"}
                {generationState === "processing" && "الفيديو قيد المعالجة"}
                {generationState === "done" && "الفيديو جاهز"}
                {generationState === "error" && "يحتاج مراجعة"}
              </div>

              {videoId ? (
                <p className="video-id">
                  Video ID
                  <strong>{videoId}</strong>
                </p>
              ) : null}

              {script ? (
                <div className="script-box">
                  <span>النص المرسل للأفاتار</span>
                  <p>{script}</p>
                </div>
              ) : null}

              {error ? <div className="error-box">{error}</div> : null}

              {resultUrl ? (
                <a className="download-button" href={resultUrl} download>
                  تحميل الفيديو
                </a>
              ) : (
                <div className="setup-note">
                  أضف <code>D_ID_API_KEY</code> في <code>.env.local</code> لتفعيل
                  التوليد الحقيقي.
                </div>
              )}
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}
