export default function CreatePanel({
  prompts,
  selectedPrompt,
  setSelectedPrompt,
  numImages,
  setNumImages,
  imageFile,
  onImageChange,
  onGenerate,
  loading,
  errorMessage
}) {
  const handleFileInput = (event) => {
    const file = event.target.files?.[0] || null;
    onImageChange(file);
  };

  return (
    <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-soft backdrop-blur-xl">
      <h2 className="text-xl font-semibold">Create</h2>
      <p className="mt-1 text-sm text-slate-300">
        Select a prompt, upload an image, and generate new variations.
      </p>

      <div className="mt-6 space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-200">
            Select Prompt
          </label>
          <select
            value={selectedPrompt}
            onChange={(e) => setSelectedPrompt(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
          >
            {prompts.length === 0 ? (
              <option value="">No prompts found</option>
            ) : (
              prompts.map((prompt) => (
                <option key={prompt.id} value={prompt.id}>
                  {prompt.name}
                </option>
              ))
            )}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-200">
            Upload Reference Image
          </label>

          <label className="flex cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-white/15 bg-slate-950/40 px-6 py-10 text-center transition hover:border-cyan-400 hover:bg-slate-950/60">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-500/10 text-3xl">
              ⬆
            </div>
            <p className="text-base font-medium text-white">
              Click to upload image
            </p>
            <p className="mt-1 text-sm text-slate-400">
              PNG, JPG, JPEG, WEBP
            </p>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileInput}
              className="hidden"
            />
          </label>

          {imageFile ? (
            <p className="mt-3 text-sm text-slate-300">
              Selected: <span className="font-medium text-white">{imageFile.name}</span>
            </p>
          ) : null}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-200">
            Number of Images
          </label>
          <input
            type="number"
            min="1"
            max="8"
            value={numImages}
            onChange={(e) => setNumImages(Number(e.target.value))}
            className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
          />
          <p className="mt-2 text-xs text-slate-400">
            Recommended: 1 to 4 for lower cost
          </p>
        </div>

        <button
          onClick={onGenerate}
          disabled={loading}
          className="w-full rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-6 py-3.5 text-base font-semibold text-slate-950 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Generating..." : "Generate Images"}
        </button>

        {errorMessage ? (
          <div className="rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
            {errorMessage}
          </div>
        ) : null}
      </div>
    </div>
  );
}