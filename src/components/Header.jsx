export default function Header({ totalCount }) {
  return (
    <header className="relative overflow-hidden border-b border-museum-border">
      {/* Grade de pontos decorativa */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #d4802a 1px, transparent 0)`,
          backgroundSize: '28px 28px',
        }}
      />

      <div className="relative max-w-5xl mx-auto px-4 pt-10 md:pt-14 pb-8 text-center">
        {/* Ornamento */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="h-px flex-1 max-w-[80px] bg-gradient-to-r from-transparent to-museum-accent/40" />
          <span className="text-museum-accent text-xl select-none">✦</span>
          <div className="h-px flex-1 max-w-[80px] bg-gradient-to-l from-transparent to-museum-accent/40" />
        </div>

        <h1 className="font-serif text-4xl md:text-6xl font-bold text-museum-text tracking-tight">
          Museu <span className="text-museum-accent italic">TCH</span>
        </h1>

        <p className="mt-3 text-museum-muted text-xs md:text-sm font-light tracking-widest uppercase">
          Arquivo Afetivo &bull; Desde 2020
        </p>

        {totalCount > 0 && (
          <div className="mt-4 inline-flex items-center gap-2 border border-museum-border rounded-full px-4 py-1.5 text-xs text-museum-muted bg-museum-surface/50">
            <span className="w-1.5 h-1.5 rounded-full bg-museum-accent animate-pulse" />
            {totalCount} pérola{totalCount !== 1 ? 's' : ''} no acervo
          </div>
        )}
      </div>
    </header>
  )
}
