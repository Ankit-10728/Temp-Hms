export default function LegalPage({ title, sections }) {
  return (
    <div className="bg-white text-ink antialiased selection:bg-brand/10 selection:text-brand-dark">
      {/* Editorial Title Section */}
      <section className="pt-32 pb-20 border-b border-line/50 bg-slate-50/30">
        <div className="max-w-5xl mx-auto px-6 lg:px-10 text-left">
          <div className="flex items-center gap-2 text-brand-dark font-mono text-xs font-bold uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
            System Governance
          </div>
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-black tracking-tight mt-4 text-ink max-w-3xl leading-[1.05]">
            {title}
          </h1>
          <div className="mt-8 flex items-center gap-4 text-xs font-medium text-ink-soft border-t border-line/60 pt-6 max-w-xs">
            <div>Revision 2.4</div>
            <div className="w-1 h-1 rounded-full bg-line" />
            <div>Updated Jan 15, 2025</div>
          </div>
        </div>
      </section>

      {/* Modern Canvas Timeline Layout */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-6 lg:px-10">
          <div className="space-y-20 relative before:absolute before:inset-y-0 before:left-0 lg:before:left-12 before:w-[2px] before:bg-gradient-to-b before:from-brand/40 before:via-line before:to-transparent">
            {sections.map((s, i) => (
              <article
                key={i}
                className="relative pl-8 lg:pl-24 grid lg:grid-cols-12 gap-6 lg:gap-12 group"
              >
                {/* Minimalist Timeline Pulse Node */}
                <div className="absolute left-[-4px] lg:left-[44px] top-3 w-[10px] h-[10px] rounded-full bg-white border-2 border-brand group-hover:bg-brand transition-colors duration-300 shadow-xs" />

                {/* Left Column: Heading & Context */}
                <div className="lg:col-span-4 space-y-2">
                  <div className="font-mono text-xs font-bold tracking-widest text-brand-dark/50 uppercase">
                    Clause {String(i + 1).padStart(2, "0")}
                  </div>
                  <h2 className="font-serif text-2xl font-bold text-ink tracking-tight leading-snug group-hover:text-brand-dark transition-colors duration-200">
                    {s.title}
                  </h2>
                </div>

                {/* Right Column: Content Body */}
                <div className="lg:col-span-8 space-y-6 text-[16px] leading-relaxed text-ink-soft/90 font-normal">
                  {s.body.map((block, j) => {
                    if (typeof block === "string") {
                      return <p key={j} className="text-justify">{block}</p>;
                    }

                    if (block.list) {
                      return (
                        <div key={j} className="grid sm:grid-cols-2 gap-3 my-6 pl-1">
                          {block.list.map((li, k) => (
                            <div key={k} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/60 border border-line/40 hover:border-brand/10 transition-colors">
                              <span className="mt-2 w-1.5 h-1.5 rounded-full bg-brand/60 flex-shrink-0" />
                              <span className="text-sm font-medium text-ink">{li}</span>
                            </div>
                          ))}
                        </div>
                      );
                    }

                    if (block.subhead) {
                      return (
                        <div key={j} className="pl-4 border-l-2 border-brand/30 bg-brand-light/10 p-4 rounded-r-xl my-4 space-y-1">
                          <h3 className="font-serif font-bold text-ink tracking-tight text-base">
                            {block.subhead}
                          </h3>
                          <p className="text-sm text-ink-soft">{block.text}</p>
                        </div>
                      );
                    }

                    return null;
                  })}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}