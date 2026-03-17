async function downloadImage(url, filename) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to download image");
    }

    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error("Download failed:", error);
    alert("Unable to download image.");
  }
}

export default function GalleryGrid({ generatedImages, loading }) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-soft backdrop-blur-xl">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">Generated Images</h2>
          <p className="mt-1 text-sm text-slate-300">
            AI-generated outputs from the FastAPI backend
          </p>
        </div>

        <div className="inline-flex w-fit items-center rounded-full border border-white/10 bg-slate-950/50 px-4 py-2 text-sm text-slate-300">
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
        <div className="grid gap-6 md:grid-cols-2 2xl:grid-cols-3">
          {generatedImages.map((img, index) => {
            const filename = img.split("/").pop();

            return (
              <div
                key={index}
                className="overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/70 shadow-soft transition hover:-translate-y-1 hover:border-cyan-400/30"
              >
                <div className="aspect-[4/4.5] overflow-hidden bg-slate-900">
                  <img
                    src={img}
                    alt={`Generated ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="space-y-4 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                        Variation
                      </p>
                      <h3 className="mt-1 text-lg font-semibold text-white">
                        Image {index + 1}
                      </h3>
                    </div>

                    <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-200">
                      Ready
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <a
                      href={img}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm font-medium text-cyan-200 transition hover:bg-cyan-400/20"
                    >
                      View
                    </a>

                    <button
                      type="button"
                      onClick={() =>
                        downloadImage(
                          `http://localhost:8000/download/${filename}`,
                          filename
                        )
                      }
                      className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10"
                    >
                      Download
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}