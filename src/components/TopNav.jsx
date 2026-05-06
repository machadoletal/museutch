const NAV_ITEMS = [
  { key: 'home',    label: 'Acervo',            icon: '🏛️' },
  { key: 'jogo',    label: 'Jogo dos Cônjuges',  icon: '🎲' },
  { key: 'ranking', label: 'Ranking',            icon: '🏆' },
  { key: 'hall',    label: 'Hall da Fama',       icon: '🌟' },
  { key: 'bracket', label: 'Bracket',            icon: '⚔️' },
]

export default function TopNav({ page, onNavigate }) {
  return (
    <nav className="sticky top-0 z-30 border-b border-museum-border bg-museum-bg/95 backdrop-blur">
      <div className="h-px bg-gradient-to-r from-transparent via-museum-accent/50 to-transparent" />
      <div className="max-w-5xl mx-auto px-4 py-2 flex items-center justify-between gap-2">
        {/* Logo compacto */}
        <button
          onClick={() => onNavigate('home')}
          className="font-serif font-bold text-sm text-museum-text hover:text-museum-accent transition-colors shrink-0"
        >
          Museu <span className="text-museum-accent italic">TCH</span>
        </button>

        {/* Links de navegação */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
          {NAV_ITEMS.map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => onNavigate(key)}
              className={`
                whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 shrink-0
                ${page === key
                  ? 'bg-museum-accent text-white shadow-md shadow-museum-accent/20'
                  : 'text-museum-muted hover:text-museum-text border border-museum-border hover:border-museum-accent/30'
                }
              `}
            >
              <span className="mr-1">{icon}</span>{label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  )
}
