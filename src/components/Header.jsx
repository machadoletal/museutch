/**
 * Header — Cabeçalho do Museu das Pérolas
 * Apresentação visual com nome do museu, subtítulo e dados do acervo.
 */
export default function Header({ totalCount }) {
  return (
    <header className="relative overflow-hidden border-b border-museum-border">
      {/* Textura de fundo decorativa */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #d4802a 1px, transparent 0)`,
          backgroundSize: '32px 32px',
        }}
      />

      {/* Linha superior decorativa */}
      <div className="h-1 w-full bg-gradient-to-r from-transparent via-museum-accent to-transparent" />

      <div className="relative max-w-5xl mx-auto px-4 py-10 md:py-14 text-center">
        {/* Ícone decorativo */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="h-px flex-1 max-w-[80px] bg-gradient-to-r from-transparent to-museum-accent/50" />
          <span className="text-museum-accent text-2xl select-none">✦</span>
          <div className="h-px flex-1 max-w-[80px] bg-gradient-to-l from-transparent to-museum-accent/50" />
        </div>

        {/* Título principal */}
        <h1 className="font-serif text-4xl md:text-6xl font-bold text-museum-text tracking-tight">
          Museu das{' '}
          <span className="text-museum-accent italic">Pérolas</span>
        </h1>

        {/* Subtítulo */}
        <p className="mt-3 text-museum-muted text-sm md:text-base font-light tracking-widest uppercase">
          Arquivo Afetivo &bull; Desde 2020
        </p>

        {/* Contador do acervo */}
        {totalCount > 0 && (
          <div className="mt-6 inline-flex items-center gap-2 border border-museum-border rounded-full px-4 py-1.5 text-xs text-museum-muted bg-museum-surface/50">
            <span className="w-1.5 h-1.5 rounded-full bg-museum-accent animate-pulse" />
            {totalCount} pérola{totalCount !== 1 ? 's' : ''} no acervo
          </div>
        )}
      </div>
    </header>
  )
}
