const form = document.getElementById("studioForm");
const stepButtons = Array.from(document.querySelectorAll(".step-pill"));
const stepPanels = Array.from(document.querySelectorAll(".wizard-step"));
const progressFill = document.getElementById("progressFill");
const prevStep = document.getElementById("prevStep");
const nextStep = document.getElementById("nextStep");
const productImage = document.getElementById("productImage");
const productPreview = document.getElementById("productPreview");
const scriptInput = document.getElementById("script");
const wordCount = document.getElementById("wordCount");
const duration = document.getElementById("duration");
const durationValue = document.getElementById("durationValue");
const generateButton = document.getElementById("generateButton");
const spinner = generateButton.querySelector(".spinner");
const statusBox = document.getElementById("statusBox");
const resultPanel = document.getElementById("resultPanel");
const resultVideo = document.getElementById("resultVideo");
const downloadLink = document.getElementById("downloadLink");
const trimmedScript = document.getElementById("trimmedScript");

let currentStep = 0;

function showStep(index) {
    currentStep = Math.max(0, Math.min(stepPanels.length - 1, index));
    stepPanels.forEach((panel, panelIndex) => {
        panel.classList.toggle("active", panelIndex === currentStep);
    });
    stepButtons.forEach((button, buttonIndex) => {
        button.classList.toggle("active", buttonIndex === currentStep);
    });

    progressFill.style.width = `${((currentStep + 1) / stepPanels.length) * 100}%`;
    prevStep.disabled = currentStep === 0;
    nextStep.classList.toggle("hidden", currentStep === stepPanels.length - 1);
}

function setStatus(message, type = "") {
    statusBox.textContent = message;
    statusBox.classList.remove("hidden", "error", "success");
    if (type) {
        statusBox.classList.add(type);
    }
}

function clearStatus() {
    statusBox.textContent = "";
    statusBox.classList.add("hidden");
    statusBox.classList.remove("error", "success");
}

function validateStep(index) {
    if (index === 0 && !productImage.files.length) {
        setStatus("يرجى رفع صورة المنتج أولاً.", "error");
        return false;
    }
    if (index === 1 && !scriptInput.value.trim()) {
        setStatus("يرجى كتابة سكربت الإعلان.", "error");
        return false;
    }
    clearStatus();
    return true;
}

stepButtons.forEach((button) => {
    button.addEventListener("click", () => {
        const target = Number(button.dataset.step);
        if (target <= currentStep || validateStep(currentStep)) {
            showStep(target);
        }
    });
});

prevStep.addEventListener("click", () => showStep(currentStep - 1));

nextStep.addEventListener("click", () => {
    if (validateStep(currentStep)) {
        showStep(currentStep + 1);
    }
});

productImage.addEventListener("change", () => {
    const file = productImage.files[0];
    if (!file) {
        productPreview.classList.add("hidden");
        productPreview.removeAttribute("src");
        return;
    }
    productPreview.src = URL.createObjectURL(file);
    productPreview.classList.remove("hidden");
});

function updateWordCount() {
    const words = scriptInput.value.trim().split(/\s+/).filter(Boolean);
    wordCount.textContent = `${words.length} كلمة`;
}

scriptInput.addEventListener("input", updateWordCount);

document.getElementById("sampleArabic").addEventListener("click", () => {
    scriptInput.value = "اكتشفوا منتجنا الجديد بتصميم فاخر وجودة عالية. عرض خاص لفترة محدودة مع تجربة استخدام مميزة تناسب كل يوم. اطلبوه الآن واستمتعوا بالأناقة والراحة.";
    updateWordCount();
});

document.getElementById("sampleEnglish").addEventListener("click", () => {
    scriptInput.value = "Meet our newest product, designed to look premium, feel reliable, and make every day easier. Try it today and enjoy a limited-time special offer.";
    updateWordCount();
});

duration.addEventListener("input", () => {
    durationValue.textContent = duration.value;
});

form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!validateStep(0) || !validateStep(1)) {
        showStep(!productImage.files.length ? 0 : 1);
        return;
    }

    resultPanel.classList.add("hidden");
    setStatus("جاري توليد الفيديو... قد يستغرق ذلك قليلاً حسب طول الصوت.", "success");
    generateButton.disabled = true;
    spinner.classList.remove("hidden");

    try {
        const response = await fetch("/generate", {
            method: "POST",
            body: new FormData(form),
        });
        const payload = await response.json();
        if (!response.ok) {
            throw new Error(payload.error || "Video generation failed.");
        }

        const cacheBust = `?v=${Date.now()}`;
        resultVideo.src = payload.video_url + cacheBust;
        downloadLink.href = payload.download_url;
        trimmedScript.textContent = `النص المقروء: ${payload.trimmed_script}`;
        resultPanel.classList.remove("hidden");
        setStatus(`تم إنشاء فيديو مدته ${payload.duration} ثانية بنجاح.`, "success");
    } catch (error) {
        setStatus(error.message, "error");
    } finally {
        generateButton.disabled = false;
        spinner.classList.add("hidden");
    }
});

showStep(0);
updateWordCount();
