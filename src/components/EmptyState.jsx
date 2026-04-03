export default function EmptyState({ hasFilters, onReset, error }) {
  if (error) {
    return (
      <div className="text-center py-20 px-4">
        <div className="text-5xl mb-4 opacity-40">⚠️</div>
        <p className="text-red-400 text-sm mb-2">Não foi possível carregar o acervo.</p>
        <p className="text-museum-muted text-xs">{error}</p>
      </div>
    )
  }

  return (
    <div className="text-center py-20 px-4">
      <div className="text-5xl mb-4 opacity-30">{hasFilters ? '🔍' : '🏛️'}</div>
      <p className="text-museum-muted text-sm">
        {hasFilters
          ? 'Nenhuma pérola encontrada com esses filtros.'
          : 'O acervo está vazio.'}
      </p>
      {hasFilters && (
        <button onClick={onReset} className="mt-4 text-sm text-museum-accent hover:underline">
          Limpar filtros
        </button>
      )}
    </div>
  )
}
