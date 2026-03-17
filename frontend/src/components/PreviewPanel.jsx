export default function PreviewPanel({ previewUrl, selectedPromptName, imageFile }) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-soft backdrop-blur-xl">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Reference Preview</h2>
          <p className="mt-1 text-sm text-slate-300">
            {selectedPromptName ? `Prompt: ${selectedPromptName}` : "No prompt selected"}
          </p>
        </div>

        {imageFile ? (
          <div className="rounded-full border border-white/10 bg-slate-950/50 px-4 py-2 text-xs text-slate-300">
            Ready for generation
          </div>
        ) : null}
      </div>

      <div className="flex min-h-[360px] items-center justify-center overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/60">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Uploaded preview"
            className="h-full max-h-[560px] w-full object-contain"
          />
        ) : (
          <div className="px-6 text-center">
            <div className="mb-3 text-5xl">🖼</div>
            <p className="text-lg font-medium text-white">No image uploaded</p>
            <p className="mt-1 text-sm text-slate-400">
              Your uploaded image preview will appear here
            </p>
          </div>
        )}
      </div>
    </div>
  );
}