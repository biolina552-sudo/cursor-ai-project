const avatarGrid = document.querySelector("#avatarGrid");
const avatarCards = Array.from(document.querySelectorAll(".avatar-card"));
const form = document.querySelector("#videoForm");
const descriptionInput = document.querySelector("#description");
const languageInput = document.querySelector("#language");
const productImageInput = document.querySelector("#productImage");
const productPreview = document.querySelector("#productPreview");
const uploadPlaceholder = document.querySelector("#uploadPlaceholder");
const fileName = document.querySelector("#fileName");
const generateButton = document.querySelector("#generateButton");
const statusBadge = document.querySelector("#statusBadge");
const resultVideo = document.querySelector("#resultVideo");
const emptyPreview = document.querySelector("#emptyPreview");
const videoIdBox = document.querySelector("#videoIdBox");
const videoIdText = document.querySelector("#videoId");
const scriptBox = document.querySelector("#scriptBox");
const scriptText = document.querySelector("#scriptText");
const errorBox = document.querySelector("#errorBox");
const downloadLink = document.querySelector("#downloadLink");

let selectedAvatar = "maya";

function setStatus(message, type = "") {
  statusBadge.textContent = message;
  statusBadge.className = `status-badge ${type}`.trim();
}

function showError(message) {
  errorBox.hidden = false;
  errorBox.textContent = message;
  setStatus("يحتاج مراجعة", "error");
}

function resetResult() {
  errorBox.hidden = true;
  errorBox.textContent = "";
  resultVideo.hidden = true;
  resultVideo.removeAttribute("src");
  resultVideo.load();
  emptyPreview.hidden = false;
  downloadLink.hidden = true;
  downloadLink.removeAttribute("href");
  videoIdBox.hidden = true;
  scriptBox.hidden = true;
}

function sleep(milliseconds) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });
}

avatarGrid.addEventListener("click", (event) => {
  const card = event.target.closest(".avatar-card");

  if (!card) {
    return;
  }

  selectedAvatar = card.dataset.avatar;
  avatarCards.forEach((avatarCard) => {
    const isSelected = avatarCard === card;
    avatarCard.classList.toggle("selected", isSelected);
    avatarCard.setAttribute("aria-pressed", String(isSelected));
  });
});

productImageInput.addEventListener("change", () => {
  const file = productImageInput.files?.[0];

  if (!file) {
    return;
  }

  fileName.textContent = file.name;
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    productPreview.src = String(reader.result);
    productPreview.hidden = false;
    uploadPlaceholder.hidden = true;
  });
  reader.readAsDataURL(file);
});

async function pollVideoStatus(id) {
  for (let attempt = 0; attempt < 45; attempt += 1) {
    await sleep(attempt < 8 ? 2500 : 5000);

    const response = await fetch(`/api/video-status/${encodeURIComponent(id)}`, {
      cache: "no-store",
    });
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.error || "فشل التحقق من حالة الفيديو.");
    }

    if (payload.status === "done" && payload.resultUrl) {
      resultVideo.src = payload.resultUrl;
      resultVideo.hidden = false;
      emptyPreview.hidden = true;
      downloadLink.href = payload.resultUrl;
      downloadLink.hidden = false;
      setStatus("الفيديو جاهز", "done");
      return;
    }

    if (payload.status === "error" || payload.status === "rejected") {
      throw new Error("رفض D-ID معالجة الفيديو. تحقق من الصورة أو المفتاح.");
    }

    setStatus(`الفيديو قيد المعالجة (${payload.status || "processing"})`, "busy");
  }

  throw new Error("الفيديو ما زال قيد المعالجة. تحقق لاحقًا من D-ID.");
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  resetResult();

  const description = descriptionInput.value.trim();

  if (!productImageInput.files?.[0]) {
    showError("يرجى رفع صورة المنتج أولًا.");
    return;
  }

  if (description.length < 12) {
    showError("اكتب وصفًا أوضح للمنتج، لا يقل عن 12 حرفًا.");
    return;
  }

  generateButton.disabled = true;
  generateButton.textContent = "جاري إرسال الطلب...";
  setStatus("إنشاء طلب الفيديو", "busy");

  try {
    const response = await fetch("/api/generate-video", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        avatarId: selectedAvatar,
        description,
        language: languageInput.value,
        productImageName: productImageInput.files[0].name,
      }),
    });
    const payload = await response.json();

    if (!response.ok || !payload.id) {
      throw new Error(payload.error || "فشل إنشاء الفيديو عبر D-ID.");
    }

    videoIdText.textContent = payload.id;
    videoIdBox.hidden = false;
    scriptText.textContent = payload.script || "";
    scriptBox.hidden = !payload.script;

    generateButton.textContent = "جاري توليد الفيديو...";
    setStatus("الفيديو قيد المعالجة", "busy");
    await pollVideoStatus(payload.id);
  } catch (error) {
    showError(error instanceof Error ? error.message : "حدث خطأ غير متوقع.");
  } finally {
    generateButton.disabled = false;
    generateButton.textContent = "توليد فيديو";
  }
});
