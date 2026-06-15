import React, { useRef, useEffect, useState, Suspense, useMemo, useCallback } from 'react'
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'
import { TextureLoader } from 'three'
import { Artwork } from '../types'

// ─── Constants ───────────────────────────────────────────────────────────────
const MAX_Z = 5
const MIN_Z = -35

// Shared gold material — created once, reused everywhere
const GOLD_MAT = new THREE.MeshStandardMaterial({ color: '#C9A84C', metalness: 0.85, roughness: 0.15 })
const GOLD_HOVERED_MAT = new THREE.MeshStandardMaterial({ color: '#E5C158', metalness: 0.85, roughness: 0.15 })
const WIRE_MAT = new THREE.MeshBasicMaterial({ color: '#111111' })
const SHADOW_MAT = new THREE.MeshBasicMaterial({ color: '#000000', transparent: true, opacity: 0.25 })

// Shared geometries — created once, reused everywhere
const FRAME_GEO = new THREE.BoxGeometry(3.2, 2.4, 0.08)
const PAINTING_GEO = new THREE.PlaneGeometry(2.8, 2.0)
const SHADOW_GEO = new THREE.PlaneGeometry(3.4, 2.6)
const WIRE_GEO = new THREE.BoxGeometry(1.23, 0.008, 0.008)
const PEG_GEO = new THREE.CylinderGeometry(0.03, 0.03, 0.06, 6) // 6-sided instead of 8

// ─── Static Starry Night Artwork ─────────────────────────────────────────────
const starryNightArtwork: Artwork = {
  id: 'starry-night-popular',
  title: 'The Starry Night',
  category: 'digital-art',
  subCategory: 'concept-art',
  artist: {
    id: 'vincent-van-gogh',
    name: 'Vincent van Gogh',
    email: '',
    college: 'Museum of Modern Art',
    branch: '',
    year: '1889',
    avatar: null,
    bio: 'Vincent Willem van Gogh was a Dutch Post-Impressionist painter who is among the most famous and influential figures in the history of Western art.',
    joinedDate: new Date('1889-06-01'),
  },
  votes: 9999,
  imageUrl: '/starry-night.jpg',
  thumbnailUrl: '/starry-night.jpg',
  videoUrl: null,
  description: 'The Starry Night is an oil-on-canvas painting by the Dutch Post-Impressionist painter Vincent van Gogh. Painted in June 1889, it depicts the view from the east-facing window of his asylum room at Saint-Rémy-de-Provence, just before sunrise, with the addition of an imaginary village.',
  status: 'approved',
  comments: [],
  createdAt: new Date('1889-06-01'),
}

// ─── Procedural tile texture (lower res) ─────────────────────────────────────
const useProceduralTileTexture = () =>
  useMemo(() => {
    if (typeof window === 'undefined') return null
    const canvas = document.createElement('canvas')
    // 512 instead of 1024 — quarter the memory, barely visible difference
    canvas.width = 512
    canvas.height = 512
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    ctx.fillStyle = '#f2eae1'
    ctx.fillRect(0, 0, 512, 512)

    const cols = 4, rows = 4
    const tw = 512 / cols, th = 512 / rows
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = c * tw, y = r * th
        const b = (Math.random() - 0.5) * 8
        ctx.fillStyle = `rgb(${242 + b},${234 + b},${225 + b})`
        ctx.fillRect(x + 2, y + 2, tw - 4, th - 4)
      }
    }
    ctx.strokeStyle = '#d8cdbf'
    ctx.lineWidth = 3
    for (let i = 0; i <= cols; i++) { ctx.beginPath(); ctx.moveTo(i * tw, 0); ctx.lineTo(i * tw, 512); ctx.stroke() }
    for (let i = 0; i <= rows; i++) { ctx.beginPath(); ctx.moveTo(0, i * th); ctx.lineTo(512, i * th); ctx.stroke() }

    const tex = new THREE.CanvasTexture(canvas)
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping
    tex.repeat.set(2, 16)
    tex.anisotropy = 4 // cap anisotropy — default 16 is expensive
    return tex
  }, [])

// ─── Painting ─────────────────────────────────────────────────────────────────
interface PaintingProps {
  artwork: Artwork
  position: [number, number, number]
  rotation: [number, number, number]
  onSelect: (artwork: Artwork) => void
  isMobile: boolean
}

// Texture cache so each URL loads only once
const textureCache = new Map<string, THREE.Texture>()

const PaintingInner: React.FC<{ url: string; hovered: boolean }> = ({ url, hovered }) => {
  const texture = useLoader(TextureLoader, url)
  // Cache it for reuse
  if (!textureCache.has(url)) textureCache.set(url, texture)
  return (
    <mesh position={[0, 0, 0.06]} geometry={PAINTING_GEO}>
      <meshBasicMaterial map={texture} toneMapped={false} opacity={hovered ? 1 : 0.93} transparent />
    </mesh>
  )
}

const FallbackPlane: React.FC = () => (
  <mesh position={[0, 0, 0.06]} geometry={PAINTING_GEO}>
    <meshBasicMaterial color="#1a1a1a" />
  </mesh>
)

const Painting: React.FC<PaintingProps> = ({ artwork, position, rotation, onSelect, isMobile }) => {
  const [hovered, setHovered] = useState(false)

  const imageUrl =
    artwork.thumbnailUrl || artwork.imageUrl ||
    'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400'

  const onOver = useCallback(() => { setHovered(true);  document.body.style.cursor = 'pointer' }, [])
  const onOut  = useCallback(() => { setHovered(false); document.body.style.cursor = 'auto'    }, [])
  const onClick = useCallback(() => onSelect(artwork), [onSelect, artwork])

  return (
    <group position={position} rotation={rotation} onClick={onClick} onPointerOver={onOver} onPointerOut={onOut}>
      {/* Peg */}
      <mesh position={[0, 1.45, -0.04]} rotation={[Math.PI / 2, 0, 0]} geometry={PEG_GEO} material={GOLD_MAT} />

      {/* Wires */}
      <mesh position={[-0.6, 1.325, -0.038]} rotation={[0, 0, -Math.atan2(0.25, 1.2)]} geometry={WIRE_GEO} material={WIRE_MAT} />
      <mesh position={[ 0.6, 1.325, -0.038]} rotation={[0, 0,  Math.atan2(0.25, 1.2)]} geometry={WIRE_GEO} material={WIRE_MAT} />

      {/* Wall shadow */}
      <mesh position={[0, 0, -0.039]} geometry={SHADOW_GEO} material={SHADOW_MAT} />

      {/* Frame */}
      <mesh geometry={FRAME_GEO} material={hovered ? GOLD_HOVERED_MAT : GOLD_MAT} />

      {/* Image */}
      <Suspense fallback={<FallbackPlane />}>
        <PaintingInner url={imageUrl} hovered={hovered} />
      </Suspense>

      {/* Single combined point light — was 2 per painting before */}
      <pointLight
        position={[0, 0, 1.2]}
        intensity={hovered ? 5 : (isMobile ? 2.2 : 1.5)}
        distance={isMobile ? 5 : 4}
        color="#FFE8A0"
      />
    </group>
  )
}

// ─── Gallery Environment ──────────────────────────────────────────────────────
const GalleryEnvironment: React.FC<{ isMobile: boolean; floorTexture: THREE.CanvasTexture | null }> = ({
  isMobile,
  floorTexture,
}) => {
  // Removed animated spotlight — was calling useFrame every tick, expensive
  const wallX = isMobile ? 3.4 : 5.0
  const fcW   = isMobile ? 6.8 : 10.0

  return (
    <>
      <ambientLight intensity={isMobile ? 0.9 : 0.7} color="#fff1e6" />
      <directionalLight position={[0, 10, 0]} intensity={0.5} color="#ffe8cc" />

      {/* 2 floor uplights instead of 3 */}
      <pointLight position={[-wallX + 0.5, -1.8, -12]} intensity={3} color="#ff9d00" distance={7} />
      <pointLight position={[ wallX - 0.5, -1.8, -26]} intensity={3} color="#ff9d00" distance={7} />

      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, -20]}>
        <planeGeometry args={[fcW, 80]} />
        <meshStandardMaterial map={floorTexture || undefined} roughness={0.2} metalness={0.15} />
      </mesh>

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 4, -20]}>
        <planeGeometry args={[fcW, 80]} />
        <meshStandardMaterial color="#f2eae1" roughness={0.85} />
      </mesh>

      {/* Walls */}
      <mesh rotation={[0,  Math.PI / 2, 0]} position={[-wallX, 1, -20]}>
        <planeGeometry args={[80, 6]} />
        <meshStandardMaterial color="#f2eae1" roughness={0.85} />
      </mesh>
      <mesh rotation={[0, -Math.PI / 2, 0]} position={[ wallX, 1, -20]}>
        <planeGeometry args={[80, 6]} />
        <meshStandardMaterial color="#f2eae1" roughness={0.85} />
      </mesh>
      <mesh position={[0, 1, -37]}>
        <planeGeometry args={[fcW, 6]} />
        <meshStandardMaterial color="#f2eae1" roughness={0.85} />
      </mesh>

      {/* Gold trims — shared material */}
      {[-wallX + 0.02, wallX - 0.02].map((x) => (
        <React.Fragment key={x}>
          <mesh position={[x, -1.9, -20]} material={GOLD_MAT}><boxGeometry args={[0.04, 0.2, 80]} /></mesh>
          <mesh position={[x,  3.9, -20]} material={GOLD_MAT}><boxGeometry args={[0.04, 0.2, 80]} /></mesh>
        </React.Fragment>
      ))}

      {/* Quote above Starry Night */}
      <Suspense fallback={null}>
        <Text
          position={[0, 2.65, -36.9]}
          fontSize={0.13}
          maxWidth={isMobile ? 5.5 : 7.5}
          color="#1c1c1c"
          textAlign="center"
          anchorX="center"
          anchorY="middle"
        >
          {"\"Great things are done by a series of small things brought together.\"\n— Vincent van Gogh"}
        </Text>
      </Suspense>

      {/* Grid helper — keep but low density */}
      <gridHelper args={[80, 20, '#C9A84C', '#1a1a1a']} position={[0, -1.98, -20]} />
    </>
  )
}

// ─── Camera Controller ────────────────────────────────────────────────────────
interface CameraControllerProps {
  scrollPercent: number
  focusedArtwork: Artwork | null
  paintings: { pos: [number, number, number]; artwork: Artwork }[]
}

const CameraController: React.FC<CameraControllerProps> = ({ scrollPercent, focusedArtwork, paintings }) => {
  const { camera, size } = useThree()
  const lookTarget = useRef(new THREE.Vector3(0, 1, -10))
  const camTarget  = useRef(new THREE.Vector3(0, 1, MAX_Z))

  useEffect(() => {
    const aspect = size.width / size.height
    const persCam = camera as THREE.PerspectiveCamera
    persCam.fov = aspect < 1.25 ? Math.min(100, Math.max(60, 2 * Math.atan(0.72 / aspect) * 180 / Math.PI)) : 60
    persCam.updateProjectionMatrix()
  }, [size.width, size.height, camera])

  useFrame(() => {
    if (focusedArtwork) {
      const p = paintings.find(x => x.artwork.id === focusedArtwork.id)
      if (p) {
        const [px, py, pz] = p.pos
        const portrait = size.width / size.height < 1.25
        if      (px < -0.1) { camTarget.current.set(px + (portrait ? 3.6 : 2.4), py, pz) }
        else if (px >  0.1) { camTarget.current.set(px - (portrait ? 3.6 : 2.4), py, pz) }
        else                { camTarget.current.set(px, py, pz + (portrait ? 4.2 : 2.8)) }
        lookTarget.current.set(px, py, pz)
      }
    } else {
      const targetZ = MAX_Z - scrollPercent * (MAX_Z - MIN_Z)
      // Removed bobbing sine wave — no perceptible loss, saves sin() per frame
      camTarget.current.set(0, 1, targetZ)
      lookTarget.current.set(0, 1, targetZ - 10)
    }

    camera.position.lerp(camTarget.current, 0.055)
    const look = lookTarget.current
    camera.lookAt(look.x, look.y, look.z)
  })

  return null
}

// ─── Main Component ───────────────────────────────────────────────────────────
interface ThreeExhibitionSceneProps {
  onArtworkSelect: (artwork: Artwork) => void
  artworks?: Artwork[]
  selectedArtwork?: Artwork | null
  enabled?: boolean
}

const ThreeExhibitionScene: React.FC<ThreeExhibitionSceneProps> = ({
  onArtworkSelect,
  artworks: propArtworks = [],
  selectedArtwork,
  enabled = true,
}) => {
  const [scrollPercent, setScrollPercent] = useState(0)
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth / window.innerHeight < 1.25)
  const [focusedArtwork, setFocusedArtwork] = useState<Artwork | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const floorTexture = useProceduralTileTexture()

  useEffect(() => {
    if (selectedArtwork === null) setFocusedArtwork(null)
    else if (selectedArtwork)    setFocusedArtwork(selectedArtwork)
  }, [selectedArtwork])

  useEffect(() => {
    const onScroll = () => {
      if (!enabled) return
      const el = containerRef.current?.closest('[data-corridor]') as HTMLElement | null
      if (!el) {
        const dh = document.documentElement.scrollHeight - window.innerHeight
        if (dh > 0) setScrollPercent(window.scrollY / dh)
        return
      }
      const scrollable = el.offsetHeight - window.innerHeight
      const scrolled   = -el.getBoundingClientRect().top
      setScrollPercent(Math.min(1, Math.max(0, scrolled / scrollable)))
    }
    const onResize = () => setIsMobile(window.innerWidth / window.innerHeight < 1.25)

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onResize) }
  }, [enabled])

  const approvedArtworks = propArtworks.filter(a => a.status === 'approved')

  const paintings = useMemo(() => {
    const wallX    = isMobile ? 3.4 : 5.0
    const paintX   = wallX - 0.04
    const stepZ    = (MAX_Z - MIN_Z - 12) / Math.max(approvedArtworks.length, 1)
    const list: { pos: [number, number, number]; rot: [number, number, number]; artwork: Artwork }[] = []

    approvedArtworks.forEach((artwork, i) => {
      const isLeft = i % 2 === 0
      list.push({
        pos: [isLeft ? -paintX : paintX, 1.0, MAX_Z - 6 - i * stepZ],
        rot: [0, isLeft ? Math.PI / 2 : -Math.PI / 2, 0],
        artwork,
      })
    })

    list.push({ pos: [0, 1.0, MIN_Z - 1.96], rot: [0, 0, 0], artwork: starryNightArtwork })
    return list
  }, [approvedArtworks, isMobile])

  const handlePaintingClick = useCallback((artwork: Artwork) => {
    setFocusedArtwork(artwork)
    setTimeout(() => onArtworkSelect(artwork), 900)
  }, [onArtworkSelect])

  return (
    <div ref={containerRef} className="w-full h-full">
      <Canvas
        camera={{ position: [0, 1.0, MAX_Z], fov: 60 }}
        style={{ background: '#080808' }}
        // Key performance options:
        // - flat: disables tone-mapping pass (saves a GPU pass)
        // - frameloop demand: only re-renders when something changes — but we need 'always' for smooth scroll
        // - dpr cap at 1.5: avoids 2× pixel ratio rendering on retina (biggest single win)
        dpr={[1, 1.5]}
        gl={{ antialias: false, powerPreference: 'high-performance', stencil: false, depth: true }}
        flat
      >
        <fog attach="fog" args={['#080808', isMobile ? 8 : 6, isMobile ? 38 : 28]} />

        <GalleryEnvironment isMobile={isMobile} floorTexture={floorTexture} />

        {paintings.map(p => (
          <Painting
            key={p.artwork.id}
            artwork={p.artwork}
            position={p.pos}
            rotation={p.rot}
            onSelect={handlePaintingClick}
            isMobile={isMobile}
          />
        ))}

        <CameraController
          scrollPercent={scrollPercent}
          focusedArtwork={focusedArtwork}
          paintings={paintings}
        />
      </Canvas>
    </div>
  )
}

export default ThreeExhibitionScene
