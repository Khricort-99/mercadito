import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outDir = resolve(__dirname, '..', 'public', 'images')

const PRODUCTS = [
  { slug: 'iphone', emoji: '📱', label: 'Tecnología', hue: 212 },
  { slug: 'macbook', emoji: '💻', label: 'Tecnología', hue: 224 },
  { slug: 'playstation', emoji: '🎮', label: 'Entretenimiento', hue: 258 },
  { slug: 'sofa', emoji: '🛋️', label: 'Hogar', hue: 24 },
  { slug: 'bicicleta', emoji: '🚵', label: 'Deportes', hue: 158 },
  { slug: 'camara', emoji: '📷', label: 'Tecnología', hue: 196 },
  { slug: 'zapatillas', emoji: '👟', label: 'Ropa', hue: 340 },
  { slug: 'guitarra', emoji: '🎸', label: 'Entretenimiento', hue: 42 },
  { slug: 'refrigerador', emoji: '🧊', label: 'Hogar', hue: 190 },
  { slug: 'watch', emoji: '⌚', label: 'Tecnología', hue: 206 },
  { slug: 'silla', emoji: '🪑', label: 'Hogar', hue: 34 },
  { slug: 'auto', emoji: '🚗', label: 'Vehículos', hue: 0 },
  { slug: 'escritorio', emoji: '🗄️', label: 'Hogar', hue: 18 },
  { slug: 'cuna', emoji: '🧸', label: 'Familia', hue: 318 },
  { slug: 'taladro', emoji: '🛠️', label: 'Herramientas', hue: 208 }
]

const escapeXml = (value) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')

function renderSvg(product, variant) {
  const { emoji, label, hue } = product
  const c1 = `hsl(${(hue + variant * 24) % 360} 70% 82%)`
  const c2 = `hsl(${(hue + 32 + variant * 20) % 360} 58% 52%)`
  const pillWidth = label.length * 24 + 72
  const rotate = variant === 0 ? -4 : variant === 1 ? 3 : -2
  const scale = variant === 0 ? 1 : variant === 1 ? 0.88 : 1.08
  const emojiY = variant === 0 ? 620 : variant === 1 ? 590 : 650

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1200" role="img" aria-label="${escapeXml(
    label
  )}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${c1}"/>
      <stop offset="100%" stop-color="${c2}"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="30%" r="65%">
      <stop offset="0%" stop-color="rgba(255,255,255,0.65)"/>
      <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
    </radialGradient>
    <filter id="soft" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="26" stdDeviation="28" flood-color="rgba(0,0,0,0.22)"/>
    </filter>
  </defs>
  <rect width="1200" height="1200" fill="url(#bg)"/>
  <rect width="1200" height="1200" fill="url(#glow)"/>
  <circle cx="${variant === 1 ? 840 : 300}" cy="${variant === 1 ? 300 : 880}" r="260" fill="rgba(255,255,255,0.14)"/>
  <circle cx="${variant === 2 ? 930 : 980}" cy="210" r="120" fill="rgba(255,255,255,0.18)"/>
  <g filter="url(#soft)" transform="translate(600 ${emojiY}) rotate(${rotate}) scale(${scale})">
    <text x="0" y="0" text-anchor="middle" dominant-baseline="central" font-size="430" font-family="'Segoe UI Emoji','Apple Color Emoji','Noto Color Emoji',sans-serif">${emoji}</text>
  </g>
  <g>
    <rect x="64" y="1052" rx="26" width="${pillWidth}" height="76" fill="rgba(255,255,255,0.9)"/>
    <text x="${64 + 34}" y="1102" font-family="'Segoe UI',Arial,sans-serif" font-size="34" font-weight="600" fill="#111827">${escapeXml(
      label
    )}</text>
  </g>
</svg>
`
}

await mkdir(outDir, { recursive: true })

for (const product of PRODUCTS) {
  for (let variant = 0; variant < 3; variant += 1) {
    const file = resolve(outDir, `${product.slug}-${variant + 1}.svg`)
    await writeFile(file, renderSvg(product, variant), 'utf8')
  }
}

console.log(`Generated ${PRODUCTS.length * 3} product images in ${outDir}`)
