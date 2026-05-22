import { Suspense, useRef, useState, useEffect, useMemo } from 'react'
import { Canvas, useFrame, type ThreeEvent } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'

/**
 * A retro CRT monitor with curved bezel, phosphor screen, and chunky case.
 * Inspired by 80s/90s monochrome terminals and the original Macintosh silhouette.
 */
function Monitor({ mouse }: { mouse: { x: number; y: number } }) {
  const group = useRef<THREE.Group>(null)
  const t = useRef(0)
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const m = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(m.matches)
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches)
    m.addEventListener('change', handler)
    return () => m.removeEventListener('change', handler)
  }, [])

  // Generate a phosphor screen texture: faint scanlines + soft vignette
  const screenTexture = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 256
    c.height = 192
    const ctx = c.getContext('2d')!
    // base phosphor wash
    const grad = ctx.createRadialGradient(128, 96, 20, 128, 96, 160)
    grad.addColorStop(0, '#c8ffe1')
    grad.addColorStop(0.6, '#3eea8a')
    grad.addColorStop(1, '#062c1a')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, 256, 192)
    // scanlines
    ctx.fillStyle = 'rgba(0,0,0,0.18)'
    for (let y = 0; y < 192; y += 2) {
      ctx.fillRect(0, y, 256, 1)
    }
    // some "text" suggestion
    ctx.fillStyle = '#9affc2'
    ctx.font = 'bold 14px monospace'
    ctx.fillText('> HELLO_WORLD', 24, 64)
    ctx.fillText('> _', 24, 92)
    const tex = new THREE.CanvasTexture(c)
    tex.colorSpace = THREE.SRGBColorSpace
    return tex
  }, [])

  useFrame((_, delta) => {
    if (!group.current) return
    if (!reduced) {
      t.current += delta
      group.current.rotation.y += delta * 0.35
      group.current.rotation.x = Math.sin(t.current * 0.6) * 0.06
    }
    const targetX = mouse.y * 0.2
    group.current.rotation.x += (targetX - group.current.rotation.x) * 0.04
  })

  // Materials
  const caseMat = (
    <meshPhysicalMaterial
      color="#dad6c8"
      metalness={0.15}
      roughness={0.45}
      iridescence={0.7}
      iridescenceIOR={1.3}
      iridescenceThicknessRange={[100, 600]}
      clearcoat={0.4}
      clearcoatRoughness={0.5}
    />
  )

  return (
    <group ref={group} position={[0, -0.1, 0]} scale={1.05}>
      {/* MAIN CASE — slightly tapered with rounded edges */}
      <RoundedBox args={[1.7, 1.45, 1.3]} radius={0.14} smoothness={6}>
        {caseMat}
      </RoundedBox>

      {/* Inner bezel ring around screen (slightly darker, recessed) */}
      <RoundedBox
        args={[1.45, 1.15, 0.06]}
        radius={0.1}
        smoothness={6}
        position={[0, 0.08, 0.66]}
      >
        <meshPhysicalMaterial
          color="#b8b3a3"
          metalness={0.2}
          roughness={0.4}
          iridescence={0.5}
          iridescenceIOR={1.3}
        />
      </RoundedBox>

      {/* Screen recess (dark inset) */}
      <mesh position={[0, 0.08, 0.685]}>
        <planeGeometry args={[1.32, 1.02]} />
        <meshBasicMaterial color="#0a0e0a" />
      </mesh>

      {/* CURVED SCREEN — slightly convex sphere segment for that retro CRT bulge */}
      <CurvedScreen position={[0, 0.08, 0.7]} texture={screenTexture} />

      {/* Screen glare highlight (soft, top-left) */}
      <mesh position={[-0.32, 0.32, 0.715]} rotation={[0, 0, -0.25]}>
        <planeGeometry args={[0.4, 0.18]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.06} />
      </mesh>

      {/* VENTILATION SLOTS on top */}
      {[-0.35, -0.18, 0, 0.18, 0.35].map((x) => (
        <mesh key={`vent-${x}`} position={[x, 0.73, -0.2]}>
          <boxGeometry args={[0.08, 0.015, 0.5]} />
          <meshStandardMaterial color="#1a1d1a" roughness={0.8} />
        </mesh>
      ))}

      {/* BRAND PLATE — small embossed rectangle bottom-center */}
      <mesh position={[0, -0.6, 0.66]}>
        <planeGeometry args={[0.42, 0.05]} />
        <meshBasicMaterial color="#7a7568" />
      </mesh>

      {/* Brand text suggestion */}
      <mesh position={[0, -0.6, 0.661]}>
        <planeGeometry args={[0.36, 0.025]} />
        <meshBasicMaterial color="#3d3a32" />
      </mesh>

      {/* POWER BUTTON — recessed circle bottom-right */}
      <mesh position={[0.6, -0.6, 0.665]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.045, 0.05, 0.015, 24]} />
        <meshStandardMaterial color="#5a554b" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[0.6, -0.6, 0.672]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.018, 0.018, 0.005, 16]} />
        <meshBasicMaterial color="#ff5a3a" />
      </mesh>

      {/* TWO ADJUSTMENT KNOBS — bottom-left of front */}
      {[-0.6, -0.48].map((x, i) => (
        <group key={`knob-${i}`} position={[x, -0.6, 0.665]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.035, 0.035, 0.02, 18]} />
            <meshStandardMaterial color="#3a362f" metalness={0.4} roughness={0.5} />
          </mesh>
          {/* tick mark on knob */}
          <mesh position={[0, 0.025, 0.011]}>
            <planeGeometry args={[0.005, 0.025]} />
            <meshBasicMaterial color="#9a9486" />
          </mesh>
        </group>
      ))}

      {/* STAND NECK — connects monitor to base */}
      <mesh position={[0, -0.83, -0.05]}>
        <boxGeometry args={[0.42, 0.16, 0.35]} />
        <meshPhysicalMaterial
          color="#d2cdbf"
          metalness={0.15}
          roughness={0.5}
          iridescence={0.5}
          iridescenceIOR={1.3}
        />
      </mesh>

      {/* BASE — wide, low, with rounded edges */}
      <RoundedBox
        args={[1.05, 0.13, 0.7]}
        radius={0.04}
        smoothness={6}
        position={[0, -0.97, -0.05]}
      >
        {caseMat}
      </RoundedBox>

      {/* Subtle shadow disc under base */}
      <mesh position={[0, -1.045, -0.05]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.65, 32]} />
        <meshBasicMaterial color="#000" transparent opacity={0.12} />
      </mesh>
    </group>
  )
}

function CurvedScreen({
  position,
  texture,
}: {
  position: [number, number, number]
  texture: THREE.Texture
}) {
  // Curved plane via sphere geometry slice — gives that retro CRT bulge
  const geom = useMemo(() => {
    const g = new THREE.SphereGeometry(2.2, 32, 16, Math.PI / 2 - 0.18, 0.36, Math.PI / 2 - 0.12, 0.24)
    return g
  }, [])

  return (
    <mesh geometry={geom} position={position} rotation={[0, 0, 0]} scale={[1, 1, -1]}>
      <meshStandardMaterial
        map={texture}
        emissive="#3eea8a"
        emissiveIntensity={0.45}
        emissiveMap={texture}
        toneMapped={false}
        roughness={0.2}
        metalness={0}
      />
    </mesh>
  )
}

export function CrtMonitor() {
  const [mouse, setMouse] = useState({ x: 0, y: 0 })

  const onMove = (e: ThreeEvent<PointerEvent>) => {
    const x = (e.uv?.x ?? 0.5) * 2 - 1
    const y = (e.uv?.y ?? 0.5) * 2 - 1
    setMouse({ x, y })
  }

  return (
    <div
      className="relative w-full aspect-square max-w-[340px] mx-auto md:mx-0"
      aria-hidden="true"
    >
      <Canvas
        camera={{ position: [0, 0.1, 3.6], fov: 38 }}
        gl={{ alpha: true, antialias: true }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.55} />
        <directionalLight position={[3, 4, 5]} intensity={1.1} castShadow />
        <directionalLight position={[-3, -1, 4]} intensity={0.4} color="#a8c9ff" />
        <directionalLight position={[0, -3, 2]} intensity={0.2} color="#ffe6b8" />
        <Suspense fallback={null}>
          <Monitor mouse={mouse} />
          <mesh onPointerMove={onMove} position={[0, 0, 1]}>
            <planeGeometry args={[10, 10]} />
            <meshBasicMaterial transparent opacity={0} />
          </mesh>
        </Suspense>
      </Canvas>
    </div>
  )
}
