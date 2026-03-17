import { useEffect, useMemo, useState } from "react";
import Header from "./components/Header";
import CreatePanel from "./components/CreatePanel";
import PreviewPanel from "./components/PreviewPanel";
import PromptUsedCard from "./components/PromptUsedCard";
import GalleryGrid from "./components/GalleryGrid";

const API_BASE_URL = "http://localhost:8000";

export default function App() {
  const [prompts, setPrompts] = useState([]);
  const [selectedPrompt, setSelectedPrompt] = useState("");
  const [numImages, setNumImages] = useState(2);
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [generatedImages, setGeneratedImages] = useState([]);
  const [promptUsed, setPromptUsed] = useState("");
  const [promptName, setPromptName] = useState("");
  const [healthModel, setHealthModel] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    loadPrompts();
    loadHealth();
  }, []);

  const selectedPromptName = useMemo(() => {
    return prompts.find((p) => p.id === selectedPrompt)?.name || "";
  }, [prompts, selectedPrompt]);

  const loadPrompts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/prompts`);
      const data = await response.json();

      setPrompts(data);
      if (data.length > 0) {
        setSelectedPrompt(data[0].id);
      }
    } catch (error) {
      console.error("Error loading prompts:", error);
      setErrorMessage("Failed to load prompts from backend.");
    }
  };

  const loadHealth = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      const data = await response.json();
      setHealthModel(data.model || "");
    } catch (error) {
      console.error("Error loading health:", error);
    }
  };

  const handleImageChange = (file) => {
    setImageFile(file || null);
    setGeneratedImages([]);
    setPromptUsed("");
    setPromptName("");
    setErrorMessage("");

    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    } else {
      setPreviewUrl("");
    }
  };

  const handleGenerate = async () => {
    if (!selectedPrompt) {
      setErrorMessage("Please select a prompt.");
      return;
    }

    if (!imageFile) {
      setErrorMessage("Please upload an image.");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setGeneratedImages([]);
    setPromptUsed("");
    setPromptName("");

    const formData = new FormData();
    formData.append("prompt_id", selectedPrompt);
    formData.append("num_images", String(numImages));
    formData.append("image", imageFile);

    try {
      const response = await fetch(`${API_BASE_URL}/generate-images`, {
        method: "POST",
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || data.message || "Image generation failed.");
      }

      setGeneratedImages(data.images || []);
      setPromptUsed(data.prompt_used || "");
      setPromptName(data.prompt_name || selectedPromptName);
    } catch (error) {
      console.error("Generation error:", error);
      setErrorMessage(error.message || "Something went wrong during generation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-white">
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10 lg:py-10">
        <Header
          promptCount={prompts.length}
          outputCount={numImages}
          loading={loading}
          model={healthModel}
        />

        <div className="mt-8 grid gap-8 lg:grid-cols-[420px_1fr]">
          <CreatePanel
            prompts={prompts}
            selectedPrompt={selectedPrompt}
            setSelectedPrompt={setSelectedPrompt}
            numImages={numImages}
            setNumImages={setNumImages}
            imageFile={imageFile}
            onImageChange={handleImageChange}
            onGenerate={handleGenerate}
            loading={loading}
            errorMessage={errorMessage}
          />

          <div className="space-y-8">
            <PreviewPanel
              previewUrl={previewUrl}
              selectedPromptName={selectedPromptName}
              imageFile={imageFile}
            />

            {promptUsed ? (
              <PromptUsedCard promptName={promptName} promptUsed={promptUsed} />
            ) : null}

            <GalleryGrid generatedImages={generatedImages} loading={loading} />
          </div>
        </div>
      </div>
    </div>
  );
}