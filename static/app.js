const form = document.querySelector("#generate-form");
const button = document.querySelector("#generate-button");
const statusEl = document.querySelector("#status");
const preview = document.querySelector("#video-preview");
const emptyPreview = document.querySelector("#empty-preview");
const downloadLink = document.querySelector("#download-link");

function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.classList.toggle("error", isError);
}

function setLoading(isLoading) {
  button.disabled = isLoading;
  button.textContent = isLoading ? "Generating..." : "Generate video";
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const description = new FormData(form).get("description").trim();
  if (!description) {
    setStatus("Please enter a product description.", true);
    return;
  }

  setLoading(true);
  setStatus("Rendering a local MP4. This can take a few seconds...");

  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description }),
    });

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      throw new Error("Server returned a non-JSON response.");
    }

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.error || "Video generation failed.");
    }

    preview.src = data.videoUrl;
    preview.classList.remove("hidden");
    emptyPreview.classList.add("hidden");

    downloadLink.href = data.downloadUrl || data.videoUrl;
    downloadLink.download = data.filename || "ai-video-studio-demo.mp4";
    downloadLink.classList.remove("hidden");
    setStatus("Video ready.");
  } catch (error) {
    setStatus(error.message, true);
  } finally {
    setLoading(false);
  }
});
