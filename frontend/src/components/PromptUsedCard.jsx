export default function PromptUsedCard({ promptName, promptUsed }) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-soft backdrop-blur-xl">
      <h2 className="text-xl font-semibold">Prompt Used</h2>

      {promptName ? (
        <div className="mt-3 inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-1.5 text-sm text-cyan-200">
          {promptName}
        </div>
      ) : null}

      <div className="mt-4 rounded-3xl border border-white/10 bg-slate-950/50 p-5">
        <p className="text-sm leading-7 text-slate-300">{promptUsed}</p>
      </div>
    </div>
  );
}