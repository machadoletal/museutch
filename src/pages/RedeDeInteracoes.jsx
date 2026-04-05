import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import ForceGraph2D from 'react-force-graph-2d'
import { usePearls } from '../hooks/usePearls'
import { calcNetwork, getTopConnections } from '../utils/calcNetwork'
import { getPersonImage } from '../utils/personImages'

function personColor(name) {
  const hue = (name || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 360
  return `hsl(${hue}, 55%, 42%)`
}

// ─── Avatar (painel flutuante) ────────────────────────────────────────────────

function NodeAvatar({ name, size = 32 }) {
  const [err, setErr] = useState(false)
  const src = getPersonImage(name)
  if (src && !err) {
    return (
      <img
        src={src} alt={name} onError={() => setErr(true)}
        style={{ width: size, height: size }}
        className="rounded-full object-cover object-top shrink-0"
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

// ─── Card flutuante de detalhes ───────────────────────────────────────────────

function FloatingCard({ node, links, onClose }) {
  const connections = getTopConnections(node.id, links, 4)
  return (
    <div className="absolute bottom-6 left-6 z-10 w-52 rounded-2xl border border-museum-border bg-museum-bg/90 backdrop-blur-sm shadow-xl animate-scale-in">
      {/* Header do card */}
      <div className="flex items-center gap-3 p-4 border-b border-museum-border/50">
        <NodeAvatar name={node.id} size={36} />
        <div className="flex-1 min-w-0">
          <p className="font-serif font-bold text-museum-text text-sm leading-tight truncate">{node.id}</p>
          <p className="text-xs text-museum-accent mt-0.5">{node.totalWeight} interaç{node.totalWeight === 1 ? 'ão' : 'ões'}</p>
        </div>
        <button onClick={onClose} className="text-museum-muted/50 hover:text-museum-muted transition text-base leading-none shrink-0">×</button>
      </div>

      {/* Top conexões */}
      {connections.length > 0 && (
        <div className="p-3 space-y-2">
          {connections.map(({ pessoa, weight }) => (
            <div key={pessoa} className="flex items-center gap-2">
              <NodeAvatar name={pessoa} size={22} />
              <span className="text-xs text-museum-text flex-1 truncate">{pessoa}</span>
              <span className="text-[11px] font-mono text-museum-muted shrink-0">{weight}×</span>
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
  const imgCache     = useRef({})

  const [dimensions,   setDimensions]   = useState({ width: 800, height: 600 })
  const [hoveredNode,  setHoveredNode]  = useState(null)
  const [selectedNode, setSelectedNode] = useState(null)

  // Dimensões responsivas
  useEffect(() => {
    const update = () => {
      if (!containerRef.current) return
      setDimensions({ width: containerRef.current.offsetWidth, height: containerRef.current.offsetHeight })
    }
    update()
    const ro = new ResizeObserver(update)
    if (containerRef.current) ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  // Pré-carregar imagens
  useEffect(() => {
    graphData.nodes.forEach(node => {
      if (imgCache.current[node.id] !== undefined) return
      const src = getPersonImage(node.id)
      if (!src) { imgCache.current[node.id] = null; return }
      imgCache.current[node.id] = null
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.src = src
      img.onload  = () => { imgCache.current[node.id] = img }
      img.onerror = () => { imgCache.current[node.id] = null }
    })
  }, [graphData.nodes])

  const handleEngineStop = useCallback(() => {
    fgRef.current?.zoomToFit(400, 80)
  }, [])

  // Conjunto de nós destacados
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

  // Renderização dos nós no canvas
  const nodeCanvasObject = useCallback((node, ctx) => {
    const { x, y } = node
    const hasHighlight = highlightNodes.size > 0
    const isActive     = !hasHighlight || highlightNodes.has(node.id)
    const isFocused    = selectedNode?.id === node.id || hoveredNode?.id === node.id
    const r = Math.sqrt(Math.max(node.val || 1, 1)) * 4.5 + 6

    ctx.save()
    ctx.globalAlpha = isActive ? 1 : 0.08

    // Anel de foco
    if (isFocused) {
      ctx.beginPath()
      ctx.arc(x, y, r + 3.5, 0, 2 * Math.PI)
      ctx.fillStyle = 'rgba(212,128,42,0.35)'
      ctx.fill()
    }

    const img = imgCache.current[node.id]
    if (img) {
      ctx.save()
      ctx.beginPath()
      ctx.arc(x, y, r, 0, 2 * Math.PI)
      ctx.clip()
      ctx.drawImage(img, x - r, y - r, r * 2, r * 2)
      ctx.restore()
      ctx.beginPath()
      ctx.arc(x, y, r, 0, 2 * Math.PI)
      ctx.strokeStyle = node.color
      ctx.lineWidth = 1.5
      ctx.stroke()
    } else {
      ctx.beginPath()
      ctx.arc(x, y, r, 0, 2 * Math.PI)
      ctx.fillStyle = node.color
      ctx.fill()
      ctx.fillStyle = 'rgba(255,255,255,0.85)'
      ctx.font = `bold ${r * 0.85}px Inter, sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(node.id[0]?.toUpperCase() || '?', x, y)
    }

    // Label: apenas para nós ativos quando há destaque, ou sempre quando não há
    if (isActive) {
      const fs = Math.max(9, r * 0.6)
      ctx.font = `${fs}px Inter, sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.fillStyle = hasHighlight ? 'rgba(232,220,200,0.9)' : 'rgba(232,220,200,0.5)'
      ctx.fillText(node.id, x, y + r + 2)
    }

    ctx.restore()
  }, [highlightNodes, selectedNode, hoveredNode])

  const getLinkColor = useCallback((link) => {
    if (highlightNodes.size === 0) return 'rgba(212,128,42,0.18)'
    const src = typeof link.source === 'object' ? link.source.id : link.source
    const tgt = typeof link.target === 'object' ? link.target.id : link.target
    return (highlightNodes.has(src) && highlightNodes.has(tgt))
      ? 'rgba(212,128,42,0.8)' : 'rgba(212,128,42,0.03)'
  }, [highlightNodes])

  const getLinkWidth = useCallback((link) => {
    const base = Math.sqrt(link.weight || 1) * 1.2
    if (highlightNodes.size === 0) return base
    const src = typeof link.source === 'object' ? link.source.id : link.source
    const tgt = typeof link.target === 'object' ? link.target.id : link.target
    return (highlightNodes.has(src) && highlightNodes.has(tgt)) ? base * 2.5 : base * 0.2
  }, [highlightNodes])

  const handleNodeHover = useCallback((node) => {
    setHoveredNode(node || null)
    if (containerRef.current) containerRef.current.style.cursor = node ? 'pointer' : 'default'
  }, [])

  const handleNodeClick = useCallback((node) => {
    setSelectedNode(prev => prev?.id === node.id ? null : node)
  }, [])

  return (
    <div className="flex flex-col bg-museum-bg text-museum-text" style={{ height: 'calc(100vh - 41px)' }}>

      {/* Cabeçalho minimalista */}
      <div className="shrink-0 px-5 py-3 flex items-center gap-3 border-b border-museum-border/40">
        <span className="text-base">🕸️</span>
        <h1 className="font-serif font-bold text-museum-text text-base">
          Rede de <span className="text-museum-accent italic">Interações</span>
        </h1>
        {!loading && !error && graphData.nodes.length > 0 && (
          <span className="text-xs text-museum-muted/50 font-mono ml-auto">
            {graphData.nodes.length} pessoas · {graphData.links.length} conexões
          </span>
        )}
      </div>

      {/* Canvas — ocupa todo o espaço restante */}
      <div ref={containerRef} className="flex-1 relative overflow-hidden">

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-7 h-7 rounded-full border-2 border-museum-accent border-t-transparent animate-spin" />
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {!loading && !error && graphData.nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-museum-muted/60 text-sm">Nenhuma sequência encontrada.</p>
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

        {/* Card flutuante de detalhes */}
        {selectedNode && (
          <FloatingCard
            node={selectedNode}
            links={graphData.links}
            onClose={() => setSelectedNode(null)}
          />
        )}

        {/* Hint discreto */}
        {!loading && !error && graphData.nodes.length > 0 && !selectedNode && !hoveredNode && (
          <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] text-museum-muted/25 font-mono pointer-events-none select-none">
            hover · clique
          </p>
        )}
      </div>
    </div>
  )
}
