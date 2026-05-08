const state = {
    currentStep: 1,
    totalSteps: 6,
    selectedAvatar: window.SHOPLINA.avatars[0]?.id || "",
    pollTimer: null,
};

const steps = [...document.querySelectorAll(".wizard-step")];
const indicators = [...document.querySelectorAll("[data-step-indicator]")];
const progressFill = document.getElementById("progressFill");
const prevButton = document.getElementById("prevButton");
const nextButton = document.getElementById("nextButton");
const studioForm = document.getElementById("studioForm");
const toast = document.getElementById("toast");
const dropzone = document.getElementById("dropzone");
const productImage = document.getElementById("productImage");
const imagePreview = document.getElementById("imagePreview");
const dropzoneCopy = document.getElementById("dropzoneCopy");
const durationRange = document.getElementById("durationRange");
const durationValue = document.getElementById("durationValue");
const generateScriptButton = document.getElementById("generateScriptButton");
const loadingOverlay = document.getElementById("loadingOverlay");
const loadingText = document.getElementById("loadingText");
const resultVideo = document.getElementById("resultVideo");
const emptyVideoState = document.getElementById("emptyVideoState");
const downloadButton = document.getElementById("downloadButton");
const newVideoButton = document.getElementById("newVideoButton");
const avatarIdInput = document.getElementById("avatarId");

function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(showToast.timeout);
    showToast.timeout = window.setTimeout(() => toast.classList.remove("show"), 4200);
}

function getSelectedLanguageKey() {
    return document.querySelector("input[name='language']:checked")?.value || "ar-gulf";
}

function getSelectedLanguage() {
    return window.SHOPLINA.languages[getSelectedLanguageKey()];
}

function getSelectedAvatar() {
    return window.SHOPLINA.avatars.find((avatar) => avatar.id === state.selectedAvatar);
}

function updateProgress() {
    steps.forEach((step) => {
        step.classList.toggle("active", Number(step.dataset.step) === state.currentStep);
    });

    indicators.forEach((indicator) => {
        const stepNumber = Number(indicator.dataset.stepIndicator);
        indicator.classList.toggle("active", stepNumber === state.currentStep);
        indicator.classList.toggle("done", stepNumber < state.currentStep);
    });

    const progress = ((state.currentStep - 1) / (state.totalSteps - 1)) * 100;
    progressFill.style.width = `${progress}%`;

    prevButton.disabled = state.currentStep === 1;
    nextButton.hidden = state.currentStep >= 5;
    if (state.currentStep === 5) {
        updateReview();
    }
}

function goToStep(stepNumber) {
    state.currentStep = Math.max(1, Math.min(state.totalSteps, stepNumber));
    updateProgress();
    document.querySelector(".studio-card").scrollIntoView({ behavior: "smooth", block: "start" });
}

function validateStep(stepNumber) {
    const productName = document.getElementById("productName").value.trim();
    const scriptText = document.getElementById("scriptText").value.trim();

    if (stepNumber === 1 && !productName) {
        showToast("أدخل اسم المنتج أولاً.");
        return false;
    }
    if (stepNumber === 2 && !scriptText) {
        showToast("اكتب السكريبت أو استخدم زر التوليد التلقائي.");
        return false;
    }
    if (stepNumber === 3 && !state.selectedAvatar) {
        showToast("اختر أفاتار مناسب للإعلان.");
        return false;
    }
    return true;
}

function updateReview() {
    const productName = document.getElementById("productName").value.trim() || "-";
    const language = getSelectedLanguage();
    const avatar = getSelectedAvatar();

    document.getElementById("reviewProduct").textContent = productName;
    document.getElementById("reviewAvatar").textContent = avatar ? `${avatar.name_ar} / ${avatar.name_en}` : "-";
    document.getElementById("reviewLanguage").textContent = language ? `${language.label_ar} / ${language.label_en}` : "-";
    document.getElementById("reviewDuration").textContent = `${durationRange.value} ثانية`;
}

function updateDuration() {
    durationValue.textContent = durationRange.value;
    const targetWords = Math.round(Number(durationRange.value) * 2.35);
    document.getElementById("scriptHint").textContent = `نصيحة: اجعل السكريبت قريبًا من ${targetWords} كلمة للحصول على إيقاع مناسب.`;
}

function handleImagePreview(file) {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        showToast("صيغة الصورة يجب أن تكون JPG أو PNG أو WEBP.");
        productImage.value = "";
        return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
        imagePreview.src = event.target.result;
        imagePreview.hidden = false;
        dropzoneCopy.hidden = true;
    };
    reader.readAsDataURL(file);
}

function generateScript() {
    const productName = document.getElementById("productName").value.trim() || "منتجك";
    const benefit = document.getElementById("productBenefit").value.trim();
    const duration = Number(durationRange.value);
    const languageKey = getSelectedLanguageKey();

    const benefitText = benefit || "جودة عالية وتجربة استخدام مميزة";
    const shortCall = "اطلبه الآن من شوبلينا قبل انتهاء العرض.";

    const templates = {
        "ar-gulf": `تدور على منتج يضيف لك قيمة من أول استخدام؟ جرّب ${productName}. يتميز بـ ${benefitText}، ومصمم ليناسب ذوقك اليومي بكل أناقة. العرض متاح لفترة محدودة، ${shortCall}`,
        "ar-morocco": `كتقلب على منتج زوين وعملي؟ ${productName} هو الاختيار المناسب. فيه ${benefitText}، وغادي يعطيك تجربة راقية وسهلة. العرض محدود، طلبو دابا من شوبلينا.`,
        en: `Looking for a product that feels premium from the first use? Meet ${productName}. It brings ${benefitText}, a polished look, and everyday value in one smart choice. Order now from Shoplina before the offer ends.`,
        fr: `Vous cherchez un produit élégant et utile au quotidien ? Découvrez ${productName}. Il offre ${benefitText}, une belle finition et une expérience simple. Commandez maintenant sur Shoplina avant la fin de l'offre.`,
    };

    let script = templates[languageKey] || templates["ar-gulf"];
    if (duration <= 20) {
        script = script.split(".").slice(0, 2).join(".").trim();
        if (!script.endsWith(".")) script += ".";
    }
    document.getElementById("scriptText").value = script;
    showToast("تم توليد سكريبت إعلاني قابل للتعديل.");
}

function setLoading(isLoading, message) {
    loadingOverlay.hidden = !isLoading;
    loadingOverlay.classList.toggle("is-visible", isLoading);
    loadingOverlay.setAttribute("aria-hidden", String(!isLoading));
    loadingText.textContent = message || "تم إرسال الطلب إلى D-ID. ننتظر تجهيز الفيديو.";
}

function setVideoResult(resultUrl) {
    resultVideo.src = resultUrl;
    resultVideo.hidden = false;
    emptyVideoState.hidden = true;
    downloadButton.href = resultUrl;
    downloadButton.classList.remove("disabled");
}

async function pollTalk(talkId, attempts = 0) {
    if (attempts > 45) {
        setLoading(false);
        showToast("استغرقت معالجة الفيديو وقتًا أطول من المتوقع. حاول التحقق لاحقًا.");
        return;
    }

    const response = await fetch(`/api/talks/${encodeURIComponent(talkId)}`);
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || "تعذر جلب حالة الفيديو من D-ID.");
    }

    if (data.status === "done" && data.result_url) {
        setLoading(false);
        setVideoResult(data.result_url);
        goToStep(6);
        showToast("اكتمل إنشاء الفيديو بنجاح.");
        return;
    }

    if (["error", "rejected"].includes(data.status)) {
        setLoading(false);
        showToast(data.error?.description || data.error || "فشل إنشاء الفيديو في D-ID.");
        return;
    }

    const statusLabel = data.status || "processing";
    setLoading(true, `حالة المعالجة: ${statusLabel}. سيتم التحديث تلقائيًا...`);
    state.pollTimer = window.setTimeout(() => pollTalk(talkId, attempts + 1), 3500);
}

async function submitGeneration(event) {
    event.preventDefault();

    if (!window.SHOPLINA.hasApiKey) {
        showToast("احفظ مفتاح D-ID API من صفحة الإعدادات أولاً.");
        return;
    }

    updateReview();
    const formData = new FormData(studioForm);
    setLoading(true, "يتم إرسال طلب إنشاء الفيديو إلى D-ID...");

    try {
        const response = await fetch("/api/generate", {
            method: "POST",
            body: formData,
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.detail?.message || data.error || "فشل إرسال الطلب.");
        }
        if (!data.talk_id) {
            throw new Error("لم يرجع D-ID رقم talk_id صالح.");
        }
        setLoading(true, "تم إنشاء الطلب. جاري تجهيز الفيديو...");
        await pollTalk(data.talk_id);
    } catch (error) {
        setLoading(false);
        showToast(error.message);
    }
}

prevButton.addEventListener("click", () => goToStep(state.currentStep - 1));
nextButton.addEventListener("click", () => {
    if (validateStep(state.currentStep)) {
        goToStep(state.currentStep + 1);
    }
});

indicators.forEach((indicator) => {
    indicator.addEventListener("click", () => {
        const targetStep = Number(indicator.dataset.stepIndicator);
        if (targetStep <= state.currentStep || validateStep(state.currentStep)) {
            goToStep(targetStep);
        }
    });
});

document.querySelectorAll(".avatar-card").forEach((card) => {
    card.addEventListener("click", () => {
        document.querySelectorAll(".avatar-card").forEach((item) => item.classList.remove("selected"));
        card.classList.add("selected");
        state.selectedAvatar = card.dataset.avatarId;
        avatarIdInput.value = state.selectedAvatar;
    });
});

durationRange.addEventListener("input", updateDuration);
generateScriptButton.addEventListener("click", generateScript);
studioForm.addEventListener("submit", submitGeneration);
newVideoButton.addEventListener("click", () => {
    window.clearTimeout(state.pollTimer);
    resultVideo.removeAttribute("src");
    resultVideo.hidden = true;
    emptyVideoState.hidden = false;
    downloadButton.href = "#";
    downloadButton.classList.add("disabled");
    goToStep(1);
});

productImage.addEventListener("change", () => handleImagePreview(productImage.files[0]));

["dragenter", "dragover"].forEach((eventName) => {
    dropzone.addEventListener(eventName, (event) => {
        event.preventDefault();
        dropzone.classList.add("dragging");
    });
});

["dragleave", "drop"].forEach((eventName) => {
    dropzone.addEventListener(eventName, (event) => {
        event.preventDefault();
        dropzone.classList.remove("dragging");
    });
});

dropzone.addEventListener("drop", (event) => {
    const file = event.dataTransfer.files[0];
    if (!file) return;

    const transfer = new DataTransfer();
    transfer.items.add(file);
    productImage.files = transfer.files;
    handleImagePreview(file);
});

document.querySelectorAll("input[name='language']").forEach((input) => {
    input.addEventListener("change", updateReview);
});

setLoading(false, "");
updateDuration();
updateProgress();
