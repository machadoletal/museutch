import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import ForceGraph2D from 'react-force-graph-2d'
import { usePearls } from '../hooks/usePearls'
import { calcNetwork, getTopConnections } from '../utils/calcNetwork'

function personColor(name) {
  const hue = (name || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 360
  return `hsl(${hue}, 60%, 55%)`
}

// ─── Tooltip flutuante (hover) ────────────────────────────────────────────────

function Tooltip({ node, links }) {
  const top = getTopConnections(node.id, links, 3)
  return (
    <div
      className="absolute top-5 right-5 z-10 rounded-xl border border-museum-border/60 bg-museum-bg/90 backdrop-blur-sm p-4 w-44 animate-fade-in pointer-events-none"
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: personColor(node.id) }} />
        <p className="font-serif font-bold text-museum-text text-sm leading-tight">{node.id}</p>
      </div>
      <p className="text-[11px] text-museum-muted mb-2">
        {node.totalWeight} interaç{node.totalWeight === 1 ? 'ão' : 'ões'} em comum
      </p>
      {top.length > 0 && (
        <div className="space-y-1 border-t border-museum-border/40 pt-2">
          {top.map(({ pessoa, weight }) => (
            <div key={pessoa} className="flex items-center justify-between gap-1">
              <span className="text-[11px] text-museum-muted truncate">{pessoa}</span>
              <span className="text-[10px] font-mono text-museum-accent shrink-0">{weight}×</span>
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

  const graphData = useMemo(() => (
    groups.length === 0 ? { nodes: [], links: [] } : calcNetwork(groups)
  ), [groups])

  const containerRef = useRef(null)
  const fgRef        = useRef(null)

  const [dimensions,  setDimensions]  = useState({ width: 800, height: 600 })
  const [hoveredNode, setHoveredNode] = useState(null)

  // Dimensões responsivas
  useEffect(() => {
    const update = () => {
      if (!containerRef.current) return
      setDimensions({
        width:  containerRef.current.offsetWidth,
        height: containerRef.current.offsetHeight,
      })
    }
    update()
    const ro = new ResizeObserver(update)
    if (containerRef.current) ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  // Ajustar forças para espaçar melhor os nós
  useEffect(() => {
    if (!fgRef.current || graphData.nodes.length === 0) return
    fgRef.current.d3Force('charge')?.strength(-220)
    fgRef.current.d3Force('link')?.distance(100)
  }, [graphData])

  const handleEngineStop = useCallback(() => {
    fgRef.current?.zoomToFit(400, 80)
  }, [])

  // Nós destacados pelo hover
  const highlightNodes = useMemo(() => {
    if (!hoveredNode) return new Set()
    const set = new Set([hoveredNode.id])
    graphData.links.forEach(l => {
      const src = typeof l.source === 'object' ? l.source.id : l.source
      const tgt = typeof l.target === 'object' ? l.target.id : l.target
      if (src === hoveredNode.id) set.add(tgt)
      if (tgt === hoveredNode.id) set.add(src)
    })
    return set
  }, [hoveredNode, graphData.links])

  // Renderização dos nós — ponto pequeno + label ao lado
  const nodeCanvasObject = useCallback((node, ctx) => {
    const { x, y } = node
    const hasHL    = highlightNodes.size > 0
    const isActive = !hasHL || highlightNodes.has(node.id)
    const isFocus  = hoveredNode?.id === node.id
    const r = 5

    ctx.save()
    ctx.globalAlpha = isActive ? 1 : 0.1

    // Anel de foco
    if (isFocus) {
      ctx.beginPath()
      ctx.arc(x, y, r + 3, 0, 2 * Math.PI)
      ctx.fillStyle = 'rgba(212,128,42,0.3)'
      ctx.fill()
    }

    // Ponto
    ctx.beginPath()
    ctx.arc(x, y, r, 0, 2 * Math.PI)
    ctx.fillStyle = personColor(node.id)
    ctx.fill()

    // Label à direita do ponto
    ctx.font = isFocus ? 'bold 12px Inter, sans-serif' : '11px Inter, sans-serif'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = hasHL
      ? (isActive ? '#e8dcc8' : 'rgba(232,220,200,0.1)')
      : 'rgba(232,220,200,0.6)'
    ctx.fillText(node.id, x + r + 5, y)

    ctx.restore()
  }, [highlightNodes, hoveredNode])

  const getLinkColor = useCallback((link) => {
    if (highlightNodes.size === 0) return 'rgba(255,255,255,0.08)'
    const src = typeof link.source === 'object' ? link.source.id : link.source
    const tgt = typeof link.target === 'object' ? link.target.id : link.target
    return (highlightNodes.has(src) && highlightNodes.has(tgt))
      ? 'rgba(212,128,42,0.7)'
      : 'rgba(255,255,255,0.02)'
  }, [highlightNodes])

  const getLinkWidth = useCallback((link) => {
    const base = Math.sqrt(link.weight || 1) * 1.2
    if (highlightNodes.size === 0) return base
    const src = typeof link.source === 'object' ? link.source.id : link.source
    const tgt = typeof link.target === 'object' ? link.target.id : link.target
    return (highlightNodes.has(src) && highlightNodes.has(tgt)) ? base * 2.5 : base * 0.15
  }, [highlightNodes])

  const handleNodeHover = useCallback((node) => {
    setHoveredNode(node || null)
    if (containerRef.current)
      containerRef.current.style.cursor = node ? 'pointer' : 'default'
  }, [])

  return (
    <div
      className="flex flex-col bg-museum-bg text-museum-text"
      style={{ height: 'calc(100vh - 41px)' }}
    >
      {/* Barra mínima */}
      <div className="shrink-0 px-5 py-2.5 flex items-center gap-2.5 border-b border-museum-border/30">
        <span>🕸️</span>
        <h1 className="font-serif font-bold text-museum-text text-sm">
          Rede de <span className="text-museum-accent italic">Interações</span>
        </h1>
        {!loading && !error && graphData.nodes.length > 0 && (
          <span className="text-xs text-museum-muted/40 font-mono ml-auto">
            {graphData.nodes.length} pessoas · {graphData.links.length} conexões
          </span>
        )}
      </div>

      {/* Área do grafo */}
      <div ref={containerRef} className="flex-1 relative overflow-hidden">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-6 rounded-full border-2 border-museum-accent border-t-transparent animate-spin" />
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {!loading && !error && graphData.nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-museum-muted/50 text-sm">Nenhuma sequência encontrada.</p>
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
            nodeVal={() => 1}
            nodeCanvasObject={nodeCanvasObject}
            nodeCanvasObjectMode={() => 'replace'}
            linkWidth={getLinkWidth}
            linkColor={getLinkColor}
            linkDirectionalParticles={0}
            onNodeHover={handleNodeHover}
            onNodeClick={null}
            onEngineStop={handleEngineStop}
            cooldownTicks={150}
            d3AlphaDecay={0.015}
            d3VelocityDecay={0.25}
            enableZoomInteraction={false}
            enablePanInteraction={false}
          />
        )}

        {/* Tooltip de hover */}
        {hoveredNode && (
          <Tooltip node={hoveredNode} links={graphData.links} />
        )}
      </div>
    </div>
  )
}
