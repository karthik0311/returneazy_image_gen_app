export default function Header({ promptCount, outputCount, loading, model }) {
  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-slate-300 backdrop-blur">
          AI Image Studio
        </div>

        <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
          Generate polished visuals from saved prompts
        </h1>

        <p className="mt-3 max-w-3xl text-base leading-7 text-slate-300 md:text-lg">
          Upload a reference image, pick a predefined prompt, and generate multiple
          AI-enhanced outputs through your FastAPI backend.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Prompts" value={String(promptCount)} />
        <StatCard label="Outputs" value={String(outputCount)} />
        <StatCard label="Status" value={loading ? "Running" : "Ready"} />
        <StatCard label="Model" value={model || "Unknown"} small />
      </div>
    </div>
  );
}

function StatCard({ label, value, small = false }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 px-5 py-4 shadow-soft backdrop-blur-xl">
      <p className="text-sm text-slate-400">{label}</p>
      <p className={`mt-1 font-semibold text-white ${small ? "text-sm break-all" : "text-2xl"}`}>
        {value}
      </p>
    </div>
  );
}