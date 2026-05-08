const form = document.querySelector("#video-form");
const button = document.querySelector("#generate-button");
const statusEl = document.querySelector("#status");
const resultPill = document.querySelector("#result-pill");
const videoPreview = document.querySelector("#video-preview");
const emptyPreview = document.querySelector("#empty-preview");
const downloadLink = document.querySelector("#download-link");
const promptEl = document.querySelector("#prompt");

const placeholders = {
  moroccan_darija:
    "مثال: فيديو سينمائي ديال كازا فالليل، الضو ديال النيون، والطوموبيلات كيدوزو بشوية...",
  gulf_arabic:
    "مثال: مشهد احترافي لصحراء وقت الغروب، سيارة فخمة تمشي بهدوء، إضاءة سينمائية...",
  english:
    "Example: A cinematic aerial shot of a futuristic city in the rain, neon lights, slow camera movement...",
  french:
    "Exemple : Une scène cinématographique d'une ville futuriste sous la pluie, lumières néon, caméra lente...",
};

document.querySelector("#language").addEventListener("change", (event) => {
  promptEl.placeholder = placeholders[event.target.value] || placeholders.english;
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  setLoading(true);
  setStatus("تم إرسال الطلب. قد يستغرق توليد الفيديو بعض الوقت...", "neutral");
  resetPreview();

  const formData = new FormData(form);
  const payload = {
    prompt: String(formData.get("prompt") || "").trim(),
    language: String(formData.get("language") || "english"),
    model: String(formData.get("model") || "").trim(),
    duration: parseOptionalNumber(formData.get("duration")),
    aspect_ratio: String(formData.get("aspect_ratio") || "").trim() || null,
  };

  try {
    const response = await fetch("/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await readJsonResponse(response);

    if (!response.ok) {
      throw new Error(data.error || "تعذر توليد الفيديو.");
    }

    videoPreview.src = data.video_url;
    videoPreview.hidden = false;
    emptyPreview.hidden = true;
    downloadLink.href = data.video_url;
    downloadLink.hidden = false;
    resultPill.textContent = "تم التوليد";
    resultPill.className = "pill pill--success";
    setStatus("تم توليد الفيديو بنجاح. يمكنك مشاهدته أو تحميله الآن.", "success");
  } catch (error) {
    resultPill.textContent = "حدث خطأ";
    resultPill.className = "pill pill--error";
    setStatus(error.message, "error");
  } finally {
    setLoading(false);
  }
});

function parseOptionalNumber(value) {
  if (value === null || value === "") {
    return null;
  }
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

async function readJsonResponse(response) {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    const text = await response.text();
    const preview = text.trim().slice(0, 120);
    throw new Error(
      preview
        ? `الخادم لم يرجع JSON من مسار التوليد. الرد بدأ بـ: ${preview}`
        : "الخادم لم يرجع JSON من مسار التوليد.",
    );
  }
  return response.json();
}

function setLoading(isLoading) {
  button.disabled = isLoading;
  button.classList.toggle("is-loading", isLoading);
}

function setStatus(message, type) {
  statusEl.textContent = message;
  statusEl.className = "status";
  if (type === "error") {
    statusEl.classList.add("status--error");
  }
  if (type === "success") {
    statusEl.classList.add("status--success");
  }
}

function resetPreview() {
  videoPreview.hidden = true;
  videoPreview.removeAttribute("src");
  videoPreview.load();
  emptyPreview.hidden = false;
  downloadLink.hidden = true;
  resultPill.textContent = "جاري المعالجة";
  resultPill.className = "pill";
}
