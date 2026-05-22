import { Suspense, useRef, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { RoundedBox, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

/**
 * A retro CRT monitor — auto-rotates continuously, drag to override.
 */
function Monitor() {
  const group = useRef<THREE.Group>(null)

  // Terminal screen texture — everything baked in, centered
  const screenTexture = useMemo(() => {
    const c = document.createElement('canvas')
    // Higher res for crisper text rendering
    c.width = 1024
    c.height = 768
    const ctx = c.getContext('2d')!

    // Deep dark background with subtle vignette
    const bg = ctx.createRadialGradient(512, 384, 160, 512, 384, 640)
    bg.addColorStop(0, '#1a1612')
    bg.addColorStop(1, '#0a0908')
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, 1024, 768)

    // Faint scanlines
    ctx.fillStyle = 'rgba(255, 200, 120, 0.04)'
    for (let y = 0; y < 768; y += 6) {
      ctx.fillRect(0, y, 1024, 2)
    }

    // Centered text
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    // Title — warm amber with soft glow
    ctx.fillStyle = '#ffc580'
    ctx.font = "bold 76px 'Courier New', monospace"
    ctx.shadowColor = 'rgba(255, 197, 128, 0.5)'
    ctx.shadowBlur = 20
    ctx.fillText("hi i'm fabio", 512, 340)
    ctx.shadowBlur = 0

    // Prompt line
    ctx.fillStyle = '#9c8a6a'
    ctx.font = "bold 52px 'Courier New', monospace"
    ctx.fillText('> _', 512, 470)

    const tex = new THREE.CanvasTexture(c)
    tex.colorSpace = THREE.SRGBColorSpace
    tex.anisotropy = 8
    tex.minFilter = THREE.LinearFilter
    tex.magFilter = THREE.LinearFilter
    return tex
  }, [])

  // Slightly warm off-white case material with subtle iridescence
  const caseMat = (
    <meshPhysicalMaterial
      color="#e8e3d2"
      metalness={0.1}
      roughness={0.55}
      iridescence={0.2}
      iridescenceIOR={1.2}
      iridescenceThicknessRange={[200, 500]}
      clearcoat={0.3}
      clearcoatRoughness={0.6}
    />
  )

  const darkPlasticMat = (
    <meshStandardMaterial color="#2a2823" roughness={0.6} metalness={0.1} />
  )

  return (
    <group ref={group} position={[0, -0.5, 0]}>
      {/* MAIN CASE */}
      <RoundedBox args={[1.6, 1.35, 1.25]} radius={0.12} smoothness={6} position={[0, 0.45, 0]}>
        {caseMat}
      </RoundedBox>

      {/* INNER BEZEL — slightly darker rim around the screen */}
      <RoundedBox
        args={[1.35, 1.1, 0.04]}
        radius={0.08}
        smoothness={6}
        position={[0, 0.5, 0.63]}
      >
        <meshPhysicalMaterial
          color="#cfc8b6"
          metalness={0.1}
          roughness={0.55}
        />
      </RoundedBox>

      {/* SCREEN PANEL — slightly recessed flat panel with the terminal texture */}
      <mesh position={[0, 0.5, 0.66]}>
        <planeGeometry args={[1.22, 0.98]} />
        <meshStandardMaterial
          map={screenTexture}
          emissive="#ffc580"
          emissiveIntensity={0.12}
          emissiveMap={screenTexture}
          toneMapped={false}
          roughness={0.3}
          metalness={0}
        />
      </mesh>

      {/* VENTILATION SLOTS on top */}
      {[-0.42, -0.21, 0, 0.21, 0.42].map((x) => (
        <mesh key={`vent-${x}`} position={[x, 1.122, -0.15]}>
          <boxGeometry args={[0.1, 0.012, 0.55]} />
          {darkPlasticMat}
        </mesh>
      ))}

      {/* BRAND PLATE — embossed silver bar under screen */}
      <mesh position={[-0.45, -0.05, 0.625]}>
        <planeGeometry args={[0.3, 0.04]} />
        <meshStandardMaterial color="#9a9486" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* POWER LED + button on lower-right */}
      <group position={[0.55, -0.05, 0.626]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.04, 0.045, 0.012, 24]} />
          <meshStandardMaterial color="#3a3630" metalness={0.4} roughness={0.5} />
        </mesh>
        <mesh position={[0, 0, 0.008]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.013, 0.013, 0.004, 16]} />
          <meshBasicMaterial color="#5fff8e" toneMapped={false} />
        </mesh>
      </group>

      {/* CALIBRATION KNOBS — lower-left of front */}
      {[-0.05, 0.05].map((dx, i) => (
        <group key={`knob-${i}`} position={[-0.6 + dx * 1.4, -0.05, 0.625]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.03, 0.032, 0.014, 18]} />
            <meshStandardMaterial color="#3a3630" metalness={0.35} roughness={0.55} />
          </mesh>
          <mesh position={[0, 0.022, 0.008]}>
            <planeGeometry args={[0.005, 0.022]} />
            <meshBasicMaterial color="#cfc8b6" />
          </mesh>
        </group>
      ))}

      {/* STAND NECK */}
      <mesh position={[0, -0.35, -0.05]}>
        <boxGeometry args={[0.38, 0.16, 0.32]} />
        <meshPhysicalMaterial
          color="#d8d2c0"
          metalness={0.1}
          roughness={0.6}
        />
      </mesh>

      {/* BASE */}
      <RoundedBox
        args={[1.0, 0.1, 0.7]}
        radius={0.04}
        smoothness={6}
        position={[0, -0.485, -0.05]}
      >
        {caseMat}
      </RoundedBox>

      {/* Subtle ground shadow */}
      <mesh position={[0, -0.54, -0.05]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.7, 32]} />
        <meshBasicMaterial color="#000" transparent opacity={0.1} />
      </mesh>
    </group>
  )
}

function Scene() {
  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  return (
    <>
      <Monitor />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 1.8}
        autoRotate={!reduced}
        autoRotateSpeed={2.75}
      />
    </>
  )
}

export function CrtMonitor() {
  return (
    <div
      className="relative w-full aspect-square max-w-[260px] sm:max-w-[300px] md:max-w-[360px] mx-auto md:mx-0 md:translate-x-[30px] cursor-grab active:cursor-grabbing"
      role="img"
      aria-label="Interactive 3D retro CRT monitor — drag to spin"
    >
      <Canvas
        camera={{ position: [0, 0.4, 4.0], fov: 38 }}
        gl={{ alpha: true, antialias: true }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 5, 4]} intensity={1.2} />
        <directionalLight position={[-4, 2, 3]} intensity={0.45} color="#cfe0ff" />
        <directionalLight position={[0, -2, 2]} intensity={0.2} color="#ffe0b8" />
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  )
}
