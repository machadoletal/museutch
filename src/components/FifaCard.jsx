/**
 * FifaCard.jsx
 * Card colecionável estilo FIFA Ultimate Team para o Hall da Fama.
 */
import { useState } from 'react'
import { getPersonImage } from '../utils/personImages'

function personColor(name) {
  const hue = (name || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 360
  return `hsl(${hue}, 55%, 42%)`
}

const TIER = {
  bronze: {
    bg:          'linear-gradient(155deg, #2a1506 0%, #5c2e10 50%, #2a1506 100%)',
    border:      '#8b5e3c',
    glow:        'rgba(139, 94, 60, 0.55)',
    overall:     '#e8a870',
    archetype:   '#b87848',
    name:        '#f0d4b0',
    statValue:   '#e8a870',
    statLabel:   'rgba(200, 154, 100, 0.72)',
    divider:     'rgba(139, 94, 60, 0.35)',
    avatarBorder:'#8b5e3c',
    shimmer:     false,
  },
  silver: {
    bg:          'linear-gradient(155deg, #1a1f28 0%, #3a4458 50%, #1a1f28 100%)',
    border:      '#6a7e94',
    glow:        'rgba(106, 126, 148, 0.55)',
    overall:     '#bccad8',
    archetype:   '#8090a8',
    name:        '#d0dce8',
    statValue:   '#bccad8',
    statLabel:   'rgba(128, 152, 176, 0.72)',
    divider:     'rgba(90, 120, 150, 0.35)',
    avatarBorder:'#6a7e94',
    shimmer:     false,
  },
  gold: {
    bg:          'linear-gradient(155deg, #1a0e00 0%, #5e3c00 50%, #1a0e00 100%)',
    border:      '#c88020',
    glow:        'rgba(200, 128, 32, 0.55)',
    overall:     '#f0c040',
    archetype:   '#d09030',
    name:        '#f8e8b8',
    statValue:   '#f0c040',
    statLabel:   'rgba(220, 180, 60, 0.72)',
    divider:     'rgba(200, 140, 30, 0.35)',
    avatarBorder:'#c88020',
    shimmer:     false,
  },
  icon: {
    bg:          'linear-gradient(155deg, #0c0800 0%, #4a3000 25%, #9a7010 50%, #4a3000 75%, #0c0800 100%)',
    border:      '#f0c840',
    glow:        'rgba(240, 200, 64, 0.75)',
    overall:     '#fff8e0',
    archetype:   '#f0d860',
    name:        '#fffce8',
    statValue:   '#fff0a0',
    statLabel:   'rgba(255, 228, 120, 0.8)',
    divider:     'rgba(240, 200, 64, 0.4)',
    avatarBorder:'#f0c840',
    shimmer:     true,
  },
}

// Pares de stats na ordem em que aparecem no card (esquerda | direita)
const STAT_PAIRS = [
  ['VOL', 'PROT'],
  ['CONS', 'ICON'],
  ['CAOS', 'MID'],
]

export default function FifaCard({ entry, onClick }) {
  const { pessoa, overall, archetype, tier, stats } = entry
  const cfg = TIER[tier] || TIER.bronze
  const [hovered, setHovered] = useState(false)
  const [imgError, setImgError] = useState(false)
  const imgSrc = getPersonImage(pessoa)

  return (
    <button
      onClick={() => onClick(entry)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative w-full focus:outline-none"
      style={{ aspectRatio: '5 / 7' }}
      title={`${pessoa} — ver perfil`}
    >
      {/* Cartão */}
      <div
        className="absolute inset-0 rounded-2xl overflow-hidden"
        style={{
          background: cfg.bg,
          border: `2px solid ${cfg.border}`,
          boxShadow: hovered
            ? `0 10px 36px rgba(0,0,0,0.75), 0 0 20px ${cfg.glow}, inset 0 0 0 1px rgba(255,255,255,0.09)`
            : `0 4px 16px rgba(0,0,0,0.55), inset 0 0 0 1px rgba(255,255,255,0.04)`,
          transform: hovered ? 'scale(1.05) translateY(-2px)' : 'scale(1)',
          transition: 'transform 0.22s ease, box-shadow 0.22s ease',
        }}
      >
        {/* Shimmer para cards ícone */}
        {cfg.shimmer && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.07) 50%, transparent 65%)',
              backgroundSize: '200% 100%',
              animation: 'card-shimmer 3.5s ease-in-out infinite',
              zIndex: 1,
            }}
          />
        )}

        {/* Conteúdo */}
        <div
          className="relative flex flex-col h-full"
          style={{ padding: '10% 10% 8%', zIndex: 2 }}
        >
          {/* Topo: overall + arquétipo */}
          <div className="flex items-start justify-between leading-none">
            <div>
              <div
                className="font-black leading-none tracking-tight"
                style={{ fontSize: 'clamp(1.9rem, 11vw, 3rem)', color: cfg.overall }}
              >
                {overall}
              </div>
              <div
                className="font-bold uppercase tracking-widest mt-[2px]"
                style={{ fontSize: 'clamp(0.48rem, 2vw, 0.66rem)', color: cfg.archetype, letterSpacing: '0.14em' }}
              >
                {archetype}
              </div>
            </div>
            {tier === 'icon' && (
              <span style={{ color: cfg.overall, fontSize: '0.75rem', opacity: 0.85, lineHeight: 1 }}>✦</span>
            )}
          </div>

          {/* Avatar — cresce para preencher o espaço central */}
          <div className="flex-1 flex items-center justify-center">
            {imgSrc && !imgError ? (
              <img
                src={imgSrc}
                alt={pessoa}
                onError={() => setImgError(true)}
                style={{
                  width: 'clamp(50px, 44%, 86px)',
                  aspectRatio: '1',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  objectPosition: 'top center',
                  border: `2.5px solid ${cfg.avatarBorder}`,
                  boxShadow: `0 0 16px ${cfg.glow}`,
                  flexShrink: 0,
                }}
              />
            ) : (
              <div
                className="rounded-full flex items-center justify-center font-black text-white shrink-0"
                style={{
                  width: 'clamp(50px, 44%, 86px)',
                  aspectRatio: '1',
                  fontSize: 'clamp(1.3rem, 5.5vw, 2rem)',
                  backgroundColor: personColor(pessoa),
                  border: `2.5px solid ${cfg.avatarBorder}`,
                  boxShadow: `0 0 16px ${cfg.glow}`,
                }}
              >
                {pessoa?.[0]?.toUpperCase() || '?'}
              </div>
            )}
          </div>

          {/* Nome */}
          <div
            className="text-center font-serif font-bold leading-tight mb-2"
            style={{ fontSize: 'clamp(0.58rem, 2.4vw, 0.82rem)', color: cfg.name }}
          >
            {pessoa}
          </div>

          {/* Divisor */}
          <div className="mb-[6px]" style={{ height: '1px', backgroundColor: cfg.divider }} />

          {/* Stats 2 × 3 */}
          <div className="grid grid-cols-2 gap-x-1 gap-y-[3px]">
            {STAT_PAIRS.map(([left, right]) => (
              <>
                <StatCell key={left}  label={left}  value={stats[left.toLowerCase()]}  cfg={cfg} />
                <StatCell key={right} label={right} value={stats[right.toLowerCase()]} cfg={cfg} />
              </>
            ))}
          </div>
        </div>
      </div>
    </button>
  )
}

function StatCell({ label, value, cfg }) {
  return (
    <div className="flex items-center gap-[3px]">
      <span
        className="font-black font-mono leading-none"
        style={{ fontSize: 'clamp(0.5rem, 1.8vw, 0.64rem)', color: cfg.statValue, minWidth: '1.6em' }}
      >
        {value}
      </span>
      <span
        className="leading-none"
        style={{ fontSize: 'clamp(0.45rem, 1.6vw, 0.58rem)', color: cfg.statLabel }}
      >
        {label}
      </span>
    </div>
  )
}
