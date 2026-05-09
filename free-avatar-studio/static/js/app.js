const form = document.getElementById("studioForm");
const stepButtons = Array.from(document.querySelectorAll(".step-pill"));
const stepPanels = Array.from(document.querySelectorAll(".wizard-step"));
const progressFill = document.getElementById("progressFill");
const prevStep = document.getElementById("prevStep");
const nextStep = document.getElementById("nextStep");
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
const avatarGrid = document.getElementById("avatarGrid");
const voiceGrid = document.getElementById("voiceGrid");
const avatarLoadStatus = document.getElementById("avatarLoadStatus");
const voiceLoadStatus = document.getElementById("voiceLoadStatus");
const refreshAvatars = document.getElementById("refreshAvatars");
const refreshVoices = document.getElementById("refreshVoices");
const settingsButton = document.getElementById("settingsButton");
const settingsDialog = document.getElementById("settingsDialog");
const closeSettings = document.getElementById("closeSettings");
const settingsForm = document.getElementById("settingsForm");
const settingsStatus = document.getElementById("settingsStatus");
const apiKeyNotice = document.getElementById("apiKeyNotice");
const heygenProgress = document.getElementById("heygenProgress");
const heygenProgressFill = document.getElementById("heygenProgressFill");

let currentStep = 0;
let hasApiKey = false;
let progressTimer = null;

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

function setBox(box, message, type = "") {
    box.textContent = message;
    box.classList.remove("hidden", "error", "success");
    if (type) {
        box.classList.add(type);
    }
}

function clearStatus() {
    statusBox.textContent = "";
    statusBox.classList.add("hidden");
    statusBox.classList.remove("error", "success");
}

function selectedValue(name) {
    const selected = form.querySelector(`input[name="${name}"]:checked`);
    return selected ? selected.value : "";
}

function validateStep(index) {
    if (!hasApiKey) {
        setStatus("يرجى حفظ مفتاح HeyGen API من Settings أولاً.", "error");
        apiKeyNotice.classList.remove("hidden");
        return false;
    }
    if (index === 1 && !scriptInput.value.trim()) {
        setStatus("يرجى كتابة سكربت الإعلان.", "error");
        return false;
    }
    if (index === 2 && !selectedValue("avatar_id")) {
        setStatus("يرجى اختيار HeyGen Avatar.", "error");
        return false;
    }
    if (index === 3 && !selectedValue("voice_id")) {
        setStatus("يرجى اختيار صوت HeyGen.", "error");
        return false;
    }
    clearStatus();
    return true;
}

async function loadSettingsStatus() {
    const response = await fetch("/api/settings");
    const payload = await response.json();
    hasApiKey = Boolean(payload.has_api_key);
    apiKeyNotice.classList.toggle("hidden", hasApiKey);
    if (hasApiKey) {
        await Promise.all([loadAvatars(), loadVoices()]);
    }
}

function normalizeError(payload, fallback) {
    return payload && payload.error ? payload.error : fallback;
}

async function loadAvatars() {
    avatarLoadStatus.textContent = "Loading HeyGen avatars...";
    avatarGrid.innerHTML = "";
    try {
        const response = await fetch("/api/heygen/avatars");
        const payload = await response.json();
        if (!response.ok) {
            throw new Error(normalizeError(payload, "Could not load avatars."));
        }
        const avatars = payload.avatars || [];
        avatarLoadStatus.textContent = `${avatars.length} avatars loaded`;
        avatarGrid.innerHTML = avatars.map((avatar, index) => `
            <label class="avatar-card heygen-card">
                <input type="radio" name="avatar_id" value="${avatar.id}" ${index === 0 ? "checked" : ""}>
                ${avatar.image_url ? `<img src="${avatar.image_url}" alt="${avatar.name || avatar.id}">` : `<div class="avatar-placeholder">AI</div>`}
                <span>${avatar.name || avatar.id}</span>
                <small>${avatar.gender || "HeyGen Avatar"}</small>
            </label>
        `).join("");
    } catch (error) {
        avatarLoadStatus.textContent = error.message;
        avatarGrid.innerHTML = `<div class="empty-state">${error.message}</div>`;
    }
}

function isArabicVoice(voice) {
    const haystack = `${voice.name || ""} ${voice.language || ""} ${voice.id || ""}`.toLowerCase();
    return haystack.includes("arabic") || haystack.includes(" ar") || haystack.includes("ar-") || haystack.includes("العربية");
}

async function loadVoices() {
    voiceLoadStatus.textContent = "Loading HeyGen voices...";
    voiceGrid.innerHTML = "";
    try {
        const response = await fetch("/api/heygen/voices");
        const payload = await response.json();
        if (!response.ok) {
            throw new Error(normalizeError(payload, "Could not load voices."));
        }
        const allVoices = payload.voices || [];
        const arabicVoices = allVoices.filter(isArabicVoice);
        const voices = arabicVoices.length ? arabicVoices : allVoices;
        voiceLoadStatus.textContent = arabicVoices.length
            ? `${arabicVoices.length} Arabic voices loaded`
            : `${voices.length} voices loaded (no Arabic filter match)`;
        voiceGrid.innerHTML = voices.map((voice, index) => `
            <label class="option-card">
                <input type="radio" name="voice_id" value="${voice.id}" ${index === 0 ? "checked" : ""}>
                <strong>${voice.name || voice.id}</strong>
                <span>${voice.language || "HeyGen Voice"} ${voice.gender ? `• ${voice.gender}` : ""}</span>
            </label>
        `).join("");
    } catch (error) {
        voiceLoadStatus.textContent = error.message;
        voiceGrid.innerHTML = `<div class="empty-state">${error.message}</div>`;
    }
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

function updateWordCount() {
    const words = scriptInput.value.trim().split(/\s+/).filter(Boolean);
    wordCount.textContent = `${words.length} كلمة`;
}

scriptInput.addEventListener("input", updateWordCount);

document.getElementById("sampleArabic").addEventListener("click", () => {
    scriptInput.value = "عطر فاخر برائحة عود وورد مميزة، يدوم طوال اليوم، مناسب للرجال والنساء. احصل عليه الآن بسعر خاص من شوبلينا.";
    updateWordCount();
});

document.getElementById("sampleEnglish").addEventListener("click", () => {
    scriptInput.value = "Meet Shoplina's premium fragrance with a luxurious oud and rose scent. Order now and enjoy a special limited-time offer.";
    updateWordCount();
});

duration.addEventListener("input", () => {
    durationValue.textContent = duration.value;
});

refreshAvatars.addEventListener("click", loadAvatars);
refreshVoices.addEventListener("click", loadVoices);

settingsButton.addEventListener("click", () => {
    settingsStatus.classList.add("hidden");
    settingsDialog.showModal();
});

closeSettings.addEventListener("click", () => {
    settingsDialog.close();
});

settingsForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(settingsForm);
    setBox(settingsStatus, "Saving API key...", "success");
    try {
        const response = await fetch("/api/settings", {
            method: "POST",
            body: formData,
        });
        const payload = await response.json();
        if (!response.ok) {
            throw new Error(normalizeError(payload, "Could not save settings."));
        }
        hasApiKey = true;
        apiKeyNotice.classList.add("hidden");
        setBox(settingsStatus, "API key saved. Loading HeyGen assets...", "success");
        await Promise.all([loadAvatars(), loadVoices()]);
        settingsDialog.close();
    } catch (error) {
        setBox(settingsStatus, error.message, "error");
    }
});

function startProgress() {
    let value = 8;
    heygenProgress.classList.remove("hidden");
    heygenProgressFill.style.width = `${value}%`;
    progressTimer = window.setInterval(() => {
        value = Math.min(92, value + Math.max(1, (95 - value) * 0.08));
        heygenProgressFill.style.width = `${value}%`;
    }, 1800);
}

function stopProgress(done = false) {
    if (progressTimer) {
        window.clearInterval(progressTimer);
        progressTimer = null;
    }
    heygenProgressFill.style.width = done ? "100%" : "0%";
    if (!done) {
        heygenProgress.classList.add("hidden");
    }
}

form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
        return;
    }

    resultPanel.classList.add("hidden");
    setStatus("HeyGen is generating the real talking avatar video. This can take a few minutes...", "success");
    generateButton.disabled = true;
    spinner.classList.remove("hidden");
    startProgress();

    try {
        const response = await fetch("/generate", {
            method: "POST",
            body: new FormData(form),
        });
        const payload = await response.json();
        if (!response.ok) {
            throw new Error(normalizeError(payload, "HeyGen video generation failed."));
        }

        stopProgress(true);
        resultVideo.src = payload.video_url;
        downloadLink.href = payload.download_url || payload.video_url;
        trimmedScript.textContent = `HeyGen video_id: ${payload.video_id}`;
        resultPanel.classList.remove("hidden");
        setStatus("HeyGen video completed successfully.", "success");
    } catch (error) {
        stopProgress(false);
        setStatus(error.message, "error");
    } finally {
        generateButton.disabled = false;
        spinner.classList.add("hidden");
    }
});

showStep(0);
updateWordCount();
loadSettingsStatus().catch((error) => {
    apiKeyNotice.classList.remove("hidden");
    setStatus(error.message, "error");
});
