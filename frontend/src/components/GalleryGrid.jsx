export default function GalleryGrid({ generatedImages, loading }) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-soft backdrop-blur-xl">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Generated Images</h2>
          <p className="mt-1 text-sm text-slate-300">
            AI-generated outputs from the FastAPI backend
          </p>
        </div>

        <div className="rounded-full border border-white/10 bg-slate-950/50 px-4 py-2 text-sm text-slate-300">
          {generatedImages.length} result{generatedImages.length !== 1 ? "s" : ""}
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-[280px] items-center justify-center rounded-[28px] border border-dashed border-white/10 bg-slate-950/50">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-cyan-400/20 border-t-cyan-400" />
            <p className="mt-4 text-base font-medium text-white">Generating images...</p>
            <p className="mt-1 text-sm text-slate-400">This may take a few moments</p>
          </div>
        </div>
      ) : generatedImages.length === 0 ? (
        <div className="flex min-h-[280px] items-center justify-center rounded-[28px] border border-dashed border-white/10 bg-slate-950/50">
          <div className="text-center">
            <div className="mb-3 text-5xl">✨</div>
            <p className="text-lg font-medium text-white">No generated images yet</p>
            <p className="mt-1 text-sm text-slate-400">
              Start a generation to populate the gallery
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {generatedImages.map((img, index) => (
            <div
              key={index}
              className="group overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/60 transition hover:-translate-y-1 hover:border-cyan-400/30"
            >
              <div className="overflow-hidden">
                <img
                  src={img}
                  alt={`Generated ${index + 1}`}
                  className="h-72 w-full object-cover transition duration-300 group-hover:scale-105"
                />
              </div>

              <div className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm text-slate-400">Variation</p>
                  <p className="font-medium text-white">Image {index + 1}</p>
                </div>

                <div className="flex gap-2">
                  <a
                    href={img}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-200 transition hover:bg-cyan-400/20"
                  >
                    View
                  </a>

                  <a
                    href={img}
                    download
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
                  >
                    Download
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}