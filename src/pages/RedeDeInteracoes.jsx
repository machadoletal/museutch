import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import ForceGraph2D from 'react-force-graph-2d'
import { usePearls } from '../hooks/usePearls'
import { calcNetwork, getTopConnections } from '../utils/calcNetwork'
import { getPersonImage } from '../utils/personImages'

function personColor(name) {
  const hue = (name || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 360
  return `hsl(${hue}, 55%, 42%)`
}

// ─── Painel de detalhes ───────────────────────────────────────────────────────

function InfoPanel({ node, links, onClose }) {
  const connections = getTopConnections(node.id, links)
  const totalInteractions = node.totalWeight

  return (
    <div className="
      lg:w-64 shrink-0
      border-t lg:border-t-0 lg:border-l border-museum-border
      bg-museum-surface/95 backdrop-blur
      p-5 flex flex-col gap-4 animate-slide-up lg:animate-none
    ">
      {/* Cabeçalho */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <NodeAvatar name={node.id} size={40} />
          <div>
            <p className="font-serif font-bold text-museum-text">{node.id}</p>
            <p className="text-xs text-museum-muted">{node.val} sequência{node.val !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-museum-muted hover:text-museum-text transition text-lg leading-none mt-0.5"
        >
          ×
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg border border-museum-border bg-museum-card p-3 text-center">
          <p className="font-bold text-museum-accent text-xl">{totalInteractions}</p>
          <p className="text-[10px] text-museum-muted uppercase tracking-wider mt-0.5">interações</p>
        </div>
        <div className="rounded-lg border border-museum-border bg-museum-card p-3 text-center">
          <p className="font-bold text-museum-text text-xl">{connections.length}</p>
          <p className="text-[10px] text-museum-muted uppercase tracking-wider mt-0.5">conexões</p>
        </div>
      </div>

      {/* Top conexões */}
      {connections.length > 0 && (
        <div>
          <p className="text-[10px] font-medium text-museum-muted uppercase tracking-wider mb-2">
            Top conexões
          </p>
          <div className="space-y-1.5">
            {connections.map(({ pessoa, weight }) => (
              <div key={pessoa} className="flex items-center gap-2">
                <NodeAvatar name={pessoa} size={24} />
                <span className="text-sm text-museum-text flex-1 truncate">{pessoa}</span>
                <span className="text-xs font-mono text-museum-accent shrink-0">×{weight}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function NodeAvatar({ name, size = 32 }) {
  const [imgError, setImgError] = useState(false)
  const imgSrc = getPersonImage(name)

  if (imgSrc && !imgError) {
    return (
      <img
        src={imgSrc}
        alt={name}
        onError={() => setImgError(true)}
        style={{ width: size, height: size, flexShrink: 0 }}
        className="rounded-full object-cover object-top border border-museum-border"
      />
    )
  }
  return (
    <div
      className="rounded-full flex items-center justify-center font-bold text-white shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.38, backgroundColor: personColor(name) }}
    >
      {name?.[0]?.toUpperCase() || '?'}
    </div>
  )
}

// ─── Grafo ────────────────────────────────────────────────────────────────────

export default function RedeDeInteracoes() {
  const { groups, loading, error } = usePearls()

  const graphData = useMemo(() => {
    if (groups.length === 0) return { nodes: [], links: [] }
    return calcNetwork(groups)
  }, [groups])

  const containerRef   = useRef(null)
  const fgRef          = useRef(null)
  const imgCache       = useRef({})
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })
  const [hoveredNode,  setHoveredNode]  = useState(null)
  const [selectedNode, setSelectedNode] = useState(null)

  // Dimensões responsivas
  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        setDimensions({
          width:  containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        })
      }
    }
    update()
    const ro = new ResizeObserver(update)
    if (containerRef.current) ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  // Pré-carregar imagens para o canvas
  useEffect(() => {
    graphData.nodes.forEach(node => {
      if (imgCache.current[node.id] !== undefined) return
      const src = getPersonImage(node.id)
      if (!src) { imgCache.current[node.id] = null; return }
      imgCache.current[node.id] = null // carregando
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.src = src
      img.onload  = () => { imgCache.current[node.id] = img }
      img.onerror = () => { imgCache.current[node.id] = null }
    })
  }, [graphData.nodes])

  // Centralizar após estabilização
  const handleEngineStop = useCallback(() => {
    fgRef.current?.zoomToFit(400, 60)
  }, [])

  // Nós e links destacados
  const highlightNodes = useMemo(() => {
    const active = selectedNode || hoveredNode
    if (!active) return new Set()
    const set = new Set([active.id])
    graphData.links.forEach(l => {
      const src = typeof l.source === 'object' ? l.source.id : l.source
      const tgt = typeof l.target === 'object' ? l.target.id : l.target
      if (src === active.id) set.add(tgt)
      if (tgt === active.id) set.add(src)
    })
    return set
  }, [hoveredNode, selectedNode, graphData.links])

  // Renderização customizada dos nós
  const nodeCanvasObject = useCallback((node, ctx) => {
    const { x, y } = node
    const isActive = highlightNodes.size === 0 || highlightNodes.has(node.id)
    const isSelected = selectedNode?.id === node.id || hoveredNode?.id === node.id
    const r = Math.sqrt(Math.max(node.val || 1, 1)) * 5 + 7

    ctx.save()
    ctx.globalAlpha = isActive ? 1 : 0.12

    // Anel de destaque
    if (isSelected) {
      ctx.beginPath()
      ctx.arc(x, y, r + 4, 0, 2 * Math.PI)
      ctx.fillStyle = '#d4802a'
      ctx.fill()
    }

    const img = imgCache.current[node.id]
    if (img) {
      // Imagem clipada em círculo
      ctx.save()
      ctx.beginPath()
      ctx.arc(x, y, r, 0, 2 * Math.PI)
      ctx.clip()
      ctx.drawImage(img, x - r, y - r, r * 2, r * 2)
      ctx.restore()
      // Borda colorida
      ctx.beginPath()
      ctx.arc(x, y, r, 0, 2 * Math.PI)
      ctx.strokeStyle = node.color
      ctx.lineWidth = 2
      ctx.stroke()
    } else {
      // Círculo colorido com inicial
      ctx.beginPath()
      ctx.arc(x, y, r, 0, 2 * Math.PI)
      ctx.fillStyle = node.color
      ctx.fill()
      ctx.fillStyle = 'rgba(255,255,255,0.9)'
      ctx.font = `bold ${r * 0.9}px Inter, system-ui, sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(node.id[0]?.toUpperCase() || '?', x, y)
    }

    // Label do nome
    const fontSize = Math.max(10, r * 0.65)
    ctx.font = `${fontSize}px Inter, system-ui, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.fillStyle = isActive ? '#e8dcc8' : 'rgba(232,220,200,0.4)'
    ctx.fillText(node.id, x, y + r + 3)

    ctx.restore()
  }, [highlightNodes, selectedNode, hoveredNode])

  const getLinkColor = useCallback((link) => {
    if (highlightNodes.size === 0) return 'rgba(212,128,42,0.25)'
    const src = typeof link.source === 'object' ? link.source.id : link.source
    const tgt = typeof link.target === 'object' ? link.target.id : link.target
    return (highlightNodes.has(src) && highlightNodes.has(tgt))
      ? 'rgba(212,128,42,0.85)'
      : 'rgba(212,128,42,0.04)'
  }, [highlightNodes])

  const getLinkWidth = useCallback((link) => {
    const base = Math.sqrt(link.weight || 1) * 1.5
    if (highlightNodes.size === 0) return base
    const src = typeof link.source === 'object' ? link.source.id : link.source
    const tgt = typeof link.target === 'object' ? link.target.id : link.target
    return (highlightNodes.has(src) && highlightNodes.has(tgt)) ? base * 2 : base * 0.3
  }, [highlightNodes])

  const handleNodeHover = useCallback((node) => {
    setHoveredNode(node || null)
    if (containerRef.current) {
      containerRef.current.style.cursor = node ? 'pointer' : 'default'
    }
  }, [])

  const handleNodeClick = useCallback((node) => {
    setSelectedNode(prev => (prev?.id === node.id ? null : node))
  }, [])

  // ── Render ────────────────────────────────────────────────────────────────

  const isEmpty = !loading && !error && graphData.nodes.length === 0

  return (
    <div className="min-h-screen bg-museum-bg text-museum-text flex flex-col">
      {/* Cabeçalho */}
      <div className="border-b border-museum-border shrink-0">
        <div className="max-w-5xl mx-auto px-4 py-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="h-px flex-1 max-w-[60px] bg-gradient-to-r from-transparent to-museum-accent/40" />
            <span className="text-xl">🕸️</span>
            <div className="h-px flex-1 max-w-[60px] bg-gradient-to-l from-transparent to-museum-accent/40" />
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-museum-text">
            Rede de <span className="text-museum-accent italic">Interações</span>
          </h1>
          <p className="mt-2 text-museum-muted text-sm max-w-md mx-auto">
            Conexões formadas por pérolas em que mais de uma pessoa aparece juntas.
            Linhas mais espessas = mais aparições em conjunto.
          </p>
          {!loading && !error && graphData.nodes.length > 0 && (
            <div className="mt-3 flex items-center justify-center gap-3 text-xs text-museum-muted/60 font-mono">
              <span>{graphData.nodes.length} pessoas</span>
              <span>·</span>
              <span>{graphData.links.length} conexões</span>
            </div>
          )}
        </div>
      </div>

      {/* Área principal */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        {/* Canvas do grafo */}
        <div
          ref={containerRef}
          className="flex-1 relative"
          style={{ minHeight: '60vh' }}
        >
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 rounded-full border-2 border-museum-accent border-t-transparent animate-spin" />
                <p className="text-sm text-museum-muted">Carregando dados…</p>
              </div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {isEmpty && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-museum-muted text-sm">Nenhuma sequência encontrada no acervo.</p>
            </div>
          )}

          {!loading && !error && graphData.nodes.length > 0 && (
            <ForceGraph2D
              ref={fgRef}
              graphData={graphData}
              width={dimensions.width}
              height={dimensions.height}
              backgroundColor="#0d0a07"
              nodeLabel={() => ''}
              nodeVal={node => Math.max(node.val || 1, 1)}
              nodeCanvasObject={nodeCanvasObject}
              nodeCanvasObjectMode={() => 'replace'}
              linkWidth={getLinkWidth}
              linkColor={getLinkColor}
              linkDirectionalParticles={0}
              onNodeHover={handleNodeHover}
              onNodeClick={handleNodeClick}
              onEngineStop={handleEngineStop}
              cooldownTicks={120}
              d3AlphaDecay={0.02}
              d3VelocityDecay={0.3}
            />
          )}

          {/* Legenda / hint */}
          {!loading && !error && graphData.nodes.length > 0 && !selectedNode && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none">
              <p className="text-[11px] text-museum-muted/40 font-mono text-center">
                hover para destacar · clique para fixar
              </p>
            </div>
          )}
        </div>

        {/* Painel de detalhes */}
        {selectedNode && (
          <InfoPanel
            node={selectedNode}
            links={graphData.links}
            onClose={() => setSelectedNode(null)}
          />
        )}
      </div>
    </div>
  )
}
