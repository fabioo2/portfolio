import { Suspense, useRef, useState, useEffect } from 'react'
import { Canvas, useFrame, type ThreeEvent } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'

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

  useFrame((_, delta) => {
    if (!group.current) return
    if (!reduced) {
      t.current += delta
      // Continuous slow Y rotation + subtle X bob
      group.current.rotation.y += delta * 0.4
      group.current.rotation.x = Math.sin(t.current * 0.8) * 0.08
    }
    // Tilt slightly toward mouse position (only nudges X, Y keeps spinning)
    const targetX = mouse.y * 0.25
    group.current.rotation.x += (targetX - group.current.rotation.x) * 0.05
  })

  return (
    <group ref={group} position={[0, -0.15, 0]}>
      {/* Body */}
      <RoundedBox args={[1.6, 1.3, 1.3]} radius={0.12} smoothness={4}>
        <meshPhysicalMaterial
          color="#e8e6df"
          metalness={0.25}
          roughness={0.35}
          iridescence={1}
          iridescenceIOR={1.3}
          iridescenceThicknessRange={[100, 800]}
          clearcoat={0.4}
          clearcoatRoughness={0.4}
        />
      </RoundedBox>

      {/* Screen recess (bezel) */}
      <RoundedBox args={[1.25, 0.95, 0.05]} radius={0.06} smoothness={4} position={[0, 0.05, 0.66]}>
        <meshStandardMaterial color="#1a1d1a" roughness={0.6} />
      </RoundedBox>

      {/* Screen surface — emissive phosphor */}
      <mesh position={[0, 0.05, 0.69]}>
        <planeGeometry args={[1.12, 0.82]} />
        <meshBasicMaterial
          color="#6fffb1"
          toneMapped={false}
        />
      </mesh>
      {/* Soft inner glow plane behind the screen */}
      <mesh position={[0, 0.05, 0.685]}>
        <planeGeometry args={[1.2, 0.9]} />
        <meshBasicMaterial color="#0f3a25" transparent opacity={0.5} />
      </mesh>

      {/* Knobs on lower-right of front face */}
      <mesh position={[0.55, -0.5, 0.66]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.03, 16]} />
        <meshStandardMaterial color="#1a1d1a" roughness={0.5} metalness={0.3} />
      </mesh>
      <mesh position={[0.55, -0.62, 0.66]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.03, 16]} />
        <meshStandardMaterial color="#1a1d1a" roughness={0.5} metalness={0.3} />
      </mesh>

      {/* Brand stripe */}
      <mesh position={[-0.45, -0.55, 0.66]}>
        <planeGeometry args={[0.35, 0.04]} />
        <meshBasicMaterial color="#1a1d1a" />
      </mesh>

      {/* Stand */}
      <RoundedBox args={[0.8, 0.12, 0.55]} radius={0.04} smoothness={4} position={[0, -0.75, -0.05]}>
        <meshPhysicalMaterial
          color="#d8d6cf"
          metalness={0.2}
          roughness={0.5}
          iridescence={1}
          iridescenceIOR={1.3}
          iridescenceThicknessRange={[100, 800]}
        />
      </RoundedBox>

      {/* Stand neck */}
      <mesh position={[0, -0.5, -0.05]}>
        <boxGeometry args={[0.3, 0.2, 0.3]} />
        <meshStandardMaterial color="#d8d6cf" metalness={0.2} roughness={0.5} />
      </mesh>
    </group>
  )
}

export function CrtMonitor() {
  const [mouse, setMouse] = useState({ x: 0, y: 0 })

  const onMove = (e: ThreeEvent<PointerEvent>) => {
    // Normalize to roughly -1..1
    const x = (e.uv?.x ?? 0.5) * 2 - 1
    const y = (e.uv?.y ?? 0.5) * 2 - 1
    setMouse({ x, y })
  }

  return (
    <div
      className="relative w-full aspect-square max-w-[320px] mx-auto md:mx-0"
      aria-hidden="true"
    >
      <Canvas
        camera={{ position: [0, 0.2, 3.6], fov: 38 }}
        gl={{ alpha: true, antialias: true }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[3, 4, 5]} intensity={1} />
        <directionalLight position={[-3, -2, 3]} intensity={0.35} color="#88c0ff" />
        <Suspense fallback={null}>
          <Monitor mouse={mouse} />
          {/* Invisible plane to capture pointer for tilt */}
          <mesh onPointerMove={onMove} position={[0, 0, 0]}>
            <planeGeometry args={[10, 10]} />
            <meshBasicMaterial transparent opacity={0} />
          </mesh>
        </Suspense>
      </Canvas>
    </div>
  )
}
