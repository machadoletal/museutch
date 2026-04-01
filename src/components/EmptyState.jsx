/**
 * EmptyState — Exibido quando nenhum resultado é encontrado com os filtros.
 */
export default function EmptyState({ hasFilters, onReset }) {
  return (
    <div className="text-center py-20 px-4">
      <div className="text-5xl mb-4 opacity-30">
        {hasFilters ? '🔍' : '🏛️'}
      </div>
      <p className="text-museum-muted text-sm">
        {hasFilters
          ? 'Nenhuma pérola encontrada com esses filtros.'
          : 'O acervo está vazio. Adicione pérolas em pearls.json!'}
      </p>
      {hasFilters && (
        <button
          onClick={onReset}
          className="mt-4 text-sm text-museum-accent hover:underline"
        >
          Limpar filtros
        </button>
      )}
    </div>
  )
}
