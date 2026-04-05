import { useState, useMemo } from 'react'
import { usePearls } from '../hooks/usePearls'
import { calcNetwork, getTopConnections } from '../utils/calcNetwork'
import { getPersonImage } from '../utils/personImages'

// ─── Constantes de layout ─────────────────────────────────────────────────────

const LAYOUT_RX = 255   // raio horizontal (elipse mais larga)
const LAYOUT_RY = 175   // raio vertical
const NODE_R    = 28    // raio de cada nó (era 22)
const LABEL_GAP = 16    // distância do rótulo à borda do nó

function personColor(name) {
  const hue = (name || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 360
  return `hsl(${hue}, 52%, 48%)`
}

// Âncora do texto com base na posição angular
function anchor(cos) {
  if (cos > 0.25) return 'start'
  if (cos < -0.25) return 'end'
  return 'middle'
}

// ─── Card de estatísticas ─────────────────────────────────────────────────────

function StatsCard({ nodeId, nodeData, links, onClose }) {
  const connections = getTopConnections(nodeId, links)
  return (
    <div className="m-4 rounded-2xl border border-museum-border bg-museum-card animate-scale-in">
      {/* Cabeçalho */}
      <div className="flex items-center gap-2.5 px-4 pt-4 pb-3 border-b border-museum-border/50">
        <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: personColor(nodeId) }} />
        <p className="font-serif font-bold text-museum-text text-sm flex-1 truncate">{nodeId}</p>
        <button
          onClick={onClose}
          className="text-museum-muted/40 hover:text-museum-muted transition text-lg leading-none"
        >×</button>
      </div>

      {/* Stats */}
      <div className="px-4 py-3 flex gap-4 border-b border-museum-border/50">
        <div className="text-center flex-1">
          <p className="text-xl font-bold text-museum-accent">{nodeData.totalWeight}</p>
          <p className="text-[10px] text-museum-muted uppercase tracking-wide mt-0.5">interações</p>
        </div>
        <div className="text-center flex-1">
          <p className="text-xl font-bold text-museum-text">{connections.length}</p>
          <p className="text-[10px] text-museum-muted uppercase tracking-wide mt-0.5">conexões</p>
        </div>
      </div>

      {/* Conexões */}
      {connections.length > 0 && (
        <div className="px-4 py-3 space-y-2">
          <p className="text-[10px] font-medium text-museum-muted uppercase tracking-wider">Com quem</p>
          {connections.map(({ pessoa, weight }) => (
            <div key={pessoa} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: personColor(pessoa) }} />
              <span className="text-xs text-museum-text flex-1 truncate">{pessoa}</span>
              <div className="flex gap-0.5 shrink-0">
                {Array.from({ length: Math.min(weight, 5) }).map((_, i) => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full bg-museum-accent/60" />
                ))}
                {weight > 5 && <span className="text-[10px] text-museum-muted">+{weight - 5}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Página ───────────────────────────────────────────────────────────────────

export default function RedeDeInteracoes() {
  const { groups, loading, error } = usePearls()
  const [selected, setSelected] = useState(null)
  const [hovered,  setHovered]  = useState(null)

  const { nodes, links } = useMemo(() => (
    groups.length === 0 ? { nodes: [], links: [] } : calcNetwork(groups)
  ), [groups])

  // Ordenar por peso total decrescente
  const sortedNodes = useMemo(() =>
    [...nodes].sort((a, b) => (b.totalWeight || 0) - (a.totalWeight || 0)),
    [nodes]
  )

  // Posição fixa em elipse
  const positioned = useMemo(() => {
    const N = sortedNodes.length
    return sortedNodes.map((node, i) => {
      const angle = (i / N) * 2 * Math.PI - Math.PI / 2
      return {
        ...node,
        x:   Math.cos(angle) * LAYOUT_RX,
        y:   Math.sin(angle) * LAYOUT_RY,
        cos: Math.cos(angle),
        sin: Math.sin(angle),
      }
    })
  }, [sortedNodes])

  const nodeMap = useMemo(() =>
    Object.fromEntries(positioned.map(n => [n.id, n])),
    [positioned]
  )

  const maxWeight = useMemo(() =>
    Math.max(...links.map(l => l.weight), 1),
    [links]
  )

  // Conjunto de nós em destaque
  const activeId = selected || hovered
  const highlightSet = useMemo(() => {
    if (!activeId) return null
    const s = new Set([activeId])
    links.forEach(l => {
      if (l.source === activeId) s.add(l.target)
      if (l.target === activeId) s.add(l.source)
    })
    return s
  }, [activeId, links])

  // ViewBox elíptico — margem para labels e anel de seleção
  const padX = NODE_R + LABEL_GAP + 50
  const padY = NODE_R + LABEL_GAP + 38
  const vW   = LAYOUT_RX + padX
  const vH   = LAYOUT_RY + padY
  const vb   = `${-vW} ${-vH} ${vW * 2} ${vH * 2}`

  const selectedData = selected ? nodeMap[selected] : null

  // ── Render ──────────────────────────────────────────────────────────────────

  if (loading) return (
    <div className="min-h-screen bg-museum-bg flex items-center justify-center">
      <div className="w-6 h-6 rounded-full border-2 border-museum-accent border-t-transparent animate-spin" />
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-museum-bg flex items-center justify-center">
      <p className="text-red-400 text-sm">{error}</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-museum-bg text-museum-text flex flex-col">

      {/* Barra mínima */}
      <div className="shrink-0 px-5 py-2.5 flex items-center gap-2.5 border-b border-museum-border/30">
        <span className="text-sm">🕸️</span>
        <h1 className="font-serif font-bold text-museum-text text-sm">
          Rede de <span className="text-museum-accent italic">Interações</span>
        </h1>
        {nodes.length > 0 && (
          <span className="text-xs text-museum-muted/35 font-mono ml-auto">
            {nodes.length} pessoas · {links.length} conexões
          </span>
        )}
      </div>

      {/* Área principal: grafo à esquerda, painel à direita */}
      <div className="flex-1 flex min-h-0 overflow-hidden">

        {/* Grafo */}
        <div className="flex-1 flex items-center justify-center p-4 min-w-0 relative">
        {nodes.length === 0 ? (
          <p className="text-museum-muted/50 text-sm">Nenhuma sequência encontrada.</p>
        ) : (
          <svg
            viewBox={vb}
            className="w-full"
            style={{ maxHeight: '80vh' }}
            onClick={e => { if (e.target === e.currentTarget) setSelected(null) }}
          >
            {/* Clip paths para as imagens */}
            <defs>
              {positioned.map(n => (
                <clipPath key={n.id} id={`rci-${n.id.replace(/[\s]/g, '_')}`}>
                  <circle cx={n.x} cy={n.y} r={NODE_R} />
                </clipPath>
              ))}
            </defs>

            {/* Arestas */}
            {links.map((link, i) => {
              const s = nodeMap[link.source]
              const t = nodeMap[link.target]
              if (!s || !t) return null
              const isLit = !highlightSet || (highlightSet.has(link.source) && highlightSet.has(link.target))
              const wt    = link.weight / maxWeight
              return (
                <line key={i}
                  x1={s.x} y1={s.y} x2={t.x} y2={t.y}
                  stroke="#d4802a"
                  strokeWidth={isLit ? 0.6 + wt * 2.8 : 0.3}
                  strokeOpacity={isLit ? 0.12 + wt * 0.6 : 0.03}
                  style={{ transition: 'stroke-opacity .25s, stroke-width .25s' }}
                />
              )
            })}

            {/* Nós */}
            {positioned.map(node => {
              const isActive   = !highlightSet || highlightSet.has(node.id)
              const isSel      = selected === node.id
              const isHov      = hovered  === node.id
              const clipId     = `rci-${node.id.replace(/[\s]/g, '_')}`
              const imgSrc     = getPersonImage(node.id)
              const lx = node.x + node.cos * (NODE_R + LABEL_GAP)
              const ly = node.y + node.sin * (NODE_R + LABEL_GAP)

              return (
                <g
                  key={node.id}
                  onClick={() => setSelected(p => p === node.id ? null : node.id)}
                  onMouseEnter={() => setHovered(node.id)}
                  onMouseLeave={() => setHovered(null)}
                  style={{
                    cursor: 'pointer',
                    opacity: isActive ? 1 : 0.12,
                    transition: 'opacity .25s',
                  }}
                >
                  {/* Anel de seleção */}
                  {isSel && (
                    <circle cx={node.x} cy={node.y} r={NODE_R + 6}
                      fill="none" stroke="#d4802a" strokeWidth={2} />
                  )}
                  {/* Anel de hover */}
                  {isHov && !isSel && (
                    <circle cx={node.x} cy={node.y} r={NODE_R + 4}
                      fill="none" stroke="#d4802a" strokeWidth={1} strokeOpacity={0.4} />
                  )}

                  {/* Círculo de fundo */}
                  <circle cx={node.x} cy={node.y} r={NODE_R} fill={personColor(node.id)} />

                  {/* Avatar */}
                  {imgSrc && (
                    <image
                      href={imgSrc}
                      x={node.x - NODE_R} y={node.y - NODE_R}
                      width={NODE_R * 2} height={NODE_R * 2}
                      clipPath={`url(#${clipId})`}
                      preserveAspectRatio="xMidYMin slice"
                    />
                  )}

                  {/* Inicial (sem imagem) */}
                  {!imgSrc && (
                    <text x={node.x} y={node.y}
                      textAnchor="middle" dominantBaseline="central"
                      fill="rgba(255,255,255,0.88)" fontSize={NODE_R * 0.78}
                      fontWeight="bold" fontFamily="Inter, sans-serif"
                    >{node.id[0]?.toUpperCase()}</text>
                  )}

                  {/* Rótulo */}
                  <text x={lx} y={ly}
                    textAnchor={anchor(node.cos)} dominantBaseline="middle"
                    fill={isSel ? '#d4802a' : isHov ? '#f0e4cc' : '#a8947a'}
                    fontSize={12} fontWeight={isSel ? 'bold' : 'normal'}
                    fontFamily="Inter, sans-serif"
                    style={{ transition: 'fill .2s', pointerEvents: 'none' }}
                  >{node.id}</text>
                </g>
              )
            })}
          </svg>
        )}

        {/* Hint */}
        {!selected && nodes.length > 0 && (
          <p className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[10px] text-museum-muted/20 font-mono pointer-events-none select-none">
            clique para ver detalhes
          </p>
        )}
        </div>

        {/* Painel direito — sempre reservado */}
        <div className="w-64 shrink-0 border-l border-museum-border/20 flex flex-col justify-center">
          {selected && selectedData ? (
            <StatsCard
              nodeId={selected}
              nodeData={selectedData}
              links={links}
              onClose={() => setSelected(null)}
            />
          ) : nodes.length > 0 && (
            <p className="text-[11px] text-museum-muted/20 text-center px-6">
              Clique em uma pessoa para ver as conexões
            </p>
          )}
        </div>

      </div>
    </div>
  )
}
