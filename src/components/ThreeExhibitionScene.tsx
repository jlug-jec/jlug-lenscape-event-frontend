import React, { useRef, useEffect, useState, Suspense, useMemo, useCallback } from 'react'
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber'
import { Text, Sparkles } from '@react-three/drei'
import * as THREE from 'three'
import { TextureLoader } from 'three'
import { Artwork } from '../types'

// ─── Constants ───────────────────────────────────────────────────────────────
const MAX_Z = 8
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

// ─── Wall Lamp Component ──────────────────────────────────────────────────────
const WallLamp: React.FC<{ position: [number, number, number]; isLeft?: boolean; rotationY?: number }> = ({ position, isLeft, rotationY }) => {
  const yRot = rotationY !== undefined ? rotationY : (isLeft ? Math.PI / 2 : -Math.PI / 2);
  return (
    <group position={position} rotation={[0, yRot, 0]}>
      {/* Base on wall */}
      <mesh position={[0, 0, 0.02]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.04, 32]} />
        <meshStandardMaterial color="#C9A84C" metalness={1} roughness={0.1} />
      </mesh>

      {/* Golden Halo Ring */}
      <mesh position={[0, 0, 0.1]} rotation={[0, 0, 0]}>
        <torusGeometry args={[0.25, 0.03, 16, 64]} />
        <meshStandardMaterial color="#fff" emissive="#ffe8cc" emissiveIntensity={1} metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Arched Arm */}
      <mesh position={[0, 0.25, 0.15]} rotation={[0, 0, 0]}>
        <torusGeometry args={[0.15, 0.015, 16, 32, Math.PI]} />
        <meshStandardMaterial color="#C9A84C" metalness={1} roughness={0.1} />
      </mesh>

      {/* Hanging Lamp Cap */}
      <mesh position={[0, 0.1, 0.3]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.08, 32]} />
        <meshStandardMaterial color="#C9A84C" metalness={1} roughness={0.1} />
      </mesh>

      {/* Cascading Glass Shade */}
      <mesh position={[0, -0.15, 0.3]} rotation={[0, 0, 0]}>
        <coneGeometry args={[0.22, 0.45, 32, 1, true]} />
        <meshPhysicalMaterial 
          color="#ffffff" 
          transmission={0.9} 
          opacity={1} 
          transparent 
          roughness={0.15} 
          ior={1.5} 
          thickness={0.02} 
          side={THREE.DoubleSide} 
        />
      </mesh>

      {/* Gold Flakes (Sparkles inside the shade) */}
      <Sparkles position={[0, -0.15, 0.3]} count={40} scale={[0.3, 0.4, 0.3]} size={1.5} color="#ffd700" speed={0.2} opacity={0.8} />

      {/* Light Source */}
      <pointLight position={[0, 0.05, 0.3]} intensity={6} color="#ffe8cc" distance={12} />
    </group>
  )
}

// ─── Chandelier Component ─────────────────────────────────────────────────────
const Chandelier: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  return (
    <group position={position}>
      {/* 1. Golden Base Mount on Ceiling */}
      <mesh position={[0, 0.75, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.05, 32]} />
        <meshStandardMaterial color="#D4AF37" metalness={1} roughness={0.2} />
      </mesh>

      {/* 2. Thin suspension wires holding the rings */}
      {[0, 1, 2].map((i) => {
        const angle = (i / 3) * Math.PI * 2;
        const x = Math.cos(angle) * 0.1;
        const z = Math.sin(angle) * 0.1;
        return (
          <mesh key={`wire-${i}`} position={[x, 0.35, z]} rotation={[0.05, angle, 0]}>
            <cylinderGeometry args={[0.003, 0.003, 0.8, 4]} />
            <meshStandardMaterial color="#aaa" metalness={0.8} roughness={0.4} />
          </mesh>
        );
      })}

      {/* 3. Intersecting / Tilted Modern Halo Rings */}
      {/* Ring 1 (Large, tilted) */}
      <group position={[0, 0, 0]} rotation={[0.3, 0.5, -0.2]}>
        <mesh>
          <torusGeometry args={[0.8, 0.02, 16, 64]} />
          <meshStandardMaterial color="#D4AF37" metalness={1} roughness={0.2} />
        </mesh>
        <mesh position={[0, -0.015, 0]}>
          <torusGeometry args={[0.78, 0.015, 16, 64]} />
          <meshStandardMaterial color="#fff" emissive="#ffe8b3" emissiveIntensity={3} />
        </mesh>
      </group>

      {/* Ring 2 (Medium, tilted opposite) */}
      <group position={[0, -0.3, 0]} rotation={[-0.4, -0.6, 0.3]}>
        <mesh>
          <torusGeometry args={[0.55, 0.02, 16, 64]} />
          <meshStandardMaterial color="#D4AF37" metalness={1} roughness={0.2} />
        </mesh>
        <mesh position={[0, -0.015, 0]}>
          <torusGeometry args={[0.53, 0.015, 16, 64]} />
          <meshStandardMaterial color="#fff" emissive="#ffe8b3" emissiveIntensity={3} />
        </mesh>
      </group>

      {/* Ring 3 (Small, horizontal) */}
      <group position={[0, -0.6, 0]} rotation={[0.1, 0, -0.1]}>
        <mesh>
          <torusGeometry args={[0.3, 0.02, 16, 64]} />
          <meshStandardMaterial color="#D4AF37" metalness={1} roughness={0.2} />
        </mesh>
        <mesh position={[0, -0.015, 0]}>
          <torusGeometry args={[0.28, 0.015, 16, 64]} />
          <meshStandardMaterial color="#fff" emissive="#ffe8b3" emissiveIntensity={3} />
        </mesh>
      </group>

      {/* 4. Core Light */}
      {/* Real illumination comes from a single point light */}
      <pointLight position={[0, -0.3, 0]} intensity={3} distance={15} color="#ffe8b3" />

      {/* 5. Dust / Sparkles inside the rings for magic ambiance */}
      <Sparkles position={[0, -0.3, 0]} count={30} scale={[1.6, 1.2, 1.6]} size={1.5} color="#ffd700" speed={0.3} opacity={0.6} />
    </group>
  );
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

      {/* Realistic Wall Lamps */}
      <WallLamp position={[-wallX, 3.5, -10]} isLeft={true} />
      <WallLamp position={[ wallX, 3.5, -16]} isLeft={false} />
      <WallLamp position={[-wallX, 3.5, -24]} isLeft={true} />
      <WallLamp position={[ wallX, 3.5, -30]} isLeft={false} />
      {/* Front Wall Lamps (Back of the hall, facing camera) */}
      <WallLamp position={[-2.5, 3.5, -36.98]} rotationY={0} />
      <WallLamp position={[ 2.5, 3.5, -36.98]} rotationY={0} />

      {/* Grand Chandeliers */}
      <Chandelier position={[0, 3.2, -4]} />
      <Chandelier position={[0, 3.2, -14]} />
      <Chandelier position={[0, 3.2, -24]} />
      <Chandelier position={[0, 3.2, -34]} />

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
        <meshStandardMaterial color="#2e2b26" roughness={0.85} />
      </mesh>
      {/* Starry sparkles on ceiling */}
      <Sparkles position={[0, 3.8, -20]} scale={[fcW, 1, 80]} count={250} speed={0.4} opacity={0.6} color="#ffe8cc" size={1.5} />

      {/* Walls */}
      <mesh rotation={[0,  Math.PI / 2, 0]} position={[-wallX, 1, -20]}>
        <planeGeometry args={[80, 6]} />
        <meshStandardMaterial color="#2e2b26" roughness={0.85} />
      </mesh>
      {/* Starry sparkles on left wall */}
      <Sparkles position={[-wallX + 0.1, 1, -20]} scale={[1, 6, 80]} count={200} speed={0.3} opacity={0.5} color="#ffe8cc" size={2} />

      <mesh rotation={[0, -Math.PI / 2, 0]} position={[ wallX, 1, -20]}>
        <planeGeometry args={[80, 6]} />
        <meshStandardMaterial color="#2e2b26" roughness={0.85} />
      </mesh>
      {/* Starry sparkles on right wall */}
      <Sparkles position={[wallX - 0.1, 1, -20]} scale={[1, 6, 80]} count={200} speed={0.3} opacity={0.5} color="#ffe8cc" size={2} />

      <mesh position={[0, 1, -37]}>
        <planeGeometry args={[fcW, 6]} />
        <meshStandardMaterial color="#2e2b26" roughness={0.85} />
      </mesh>
      {/* Starry sparkles on back wall */}
      <Sparkles position={[0, 1, -36.9]} scale={[fcW, 6, 1]} count={50} speed={0.3} opacity={0.5} color="#ffe8cc" size={2} />

      {/* Gold trims — shared material */}
      {[-wallX + 0.02, wallX - 0.02].map((x) => (
        <React.Fragment key={x}>
          <mesh position={[x, -1.9, -20]} material={GOLD_MAT}><boxGeometry args={[0.04, 0.2, 80]} /></mesh>
          <mesh position={[x,  3.9, -20]} material={GOLD_MAT}><boxGeometry args={[0.04, 0.2, 80]} /></mesh>
        </React.Fragment>
      ))}
      {/* Back wall gold trims */}
      <mesh position={[0, -1.9, -36.98]} material={GOLD_MAT}><boxGeometry args={[fcW, 0.2, 0.04]} /></mesh>
      <mesh position={[0,  3.9, -36.98]} material={GOLD_MAT}><boxGeometry args={[fcW, 0.2, 0.04]} /></mesh>

      {/* Quote above Starry Night */}
      <Suspense fallback={null}>
        <Text
          position={[0, 2.65, -36.9]}
          fontSize={0.13}
          maxWidth={isMobile ? 5.5 : 7.5}
          color="#C9A84C"
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
      // Re-map the scroll percentage so the camera reaches its destination at 80% of the total scroll.
      // This leaves the remaining 20% of the scroll container to just hold the view, 
      // ensuring the lerp completes and the painting fully covers the screen 
      // BEFORE the sticky container releases and scrolls up.
      const effectiveScroll = Math.min(1.0, scrollPercent / 0.8);

      // End the scroll very close to Starry Night so it fills the screen completely.
      // Starry Night is located at MIN_Z - 1.96. 
      // A distance of ~0.5 units guarantees it covers both mobile and desktop viewports.
      const END_Z = MIN_Z - 1.96 + 0.5;
      const targetZ = MAX_Z - effectiveScroll * (MAX_Z - END_Z)
      
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
    const stepZ    = (MAX_Z - MIN_Z - 16) / Math.max(approvedArtworks.length, 1)
    const list: { pos: [number, number, number]; rot: [number, number, number]; artwork: Artwork }[] = []

    approvedArtworks.forEach((artwork, i) => {
      const isLeft = i % 2 === 0
      list.push({
        pos: [isLeft ? -paintX : paintX, 1.0, MAX_Z - 10 - i * stepZ],
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
