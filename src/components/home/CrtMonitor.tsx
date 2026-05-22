import { Suspense, useRef, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { RoundedBox, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

/**
 * A retro CRT monitor — auto-rotates continuously, drag to override.
 */
function Monitor() {
  const group = useRef<THREE.Group>(null)

  // Screen content texture — dark screen + scanlines + terminal text.
  // Aspect (1024x768 → 1.333) matches the front face of the screen box so
  // the text isn't stretched. The bezel is provided by the box's side faces.
  const screenTexture = useMemo(() => {
    const c = document.createElement('canvas')
    const W = 1024
    const H = 768
    c.width = W
    c.height = H
    const ctx = c.getContext('2d')!

    // Dark screen surface
    ctx.fillStyle = '#070a07'
    ctx.fillRect(0, 0, W, H)

    // Subtle phosphor scanlines
    ctx.fillStyle = 'rgba(95, 255, 142, 0.04)'
    for (let y = 0; y < H; y += 4) {
      ctx.fillRect(0, y, W, 1)
    }

    // Centered prompt line, terminal green with soft glow
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = '#7bff9c'
    ctx.font = "bold 62px 'Courier New', monospace"
    ctx.shadowColor = 'rgba(95, 255, 142, 0.55)'
    ctx.shadowBlur = 18
    ctx.fillText("> hi i'm fabio _", W / 2, H / 2)

    const tex = new THREE.CanvasTexture(c)
    tex.colorSpace = THREE.SRGBColorSpace
    tex.anisotropy = 8
    tex.minFilter = THREE.LinearFilter
    tex.magFilter = THREE.LinearFilter
    return tex
  }, [])

  // Slightly warm off-white case material — no iridescence (was shimmering
  // on the case edges during rotation).
  const caseMat = (
    <meshStandardMaterial
      color="#e8e3d2"
      metalness={0.12}
      roughness={0.5}
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

      {/* SCREEN — a thin box. Front face shows the green terminal texture;
          side/edge faces form the dark bezel rising out of the case. Single
          mesh = no Z-fighting possible. Aspect matches the texture. */}
      <mesh position={[0, 0.5, 0.665]}>
        <boxGeometry args={[1.36, 1.02, 0.1]} />
        <meshStandardMaterial attach="material-0" color="#2a2620" roughness={0.55} metalness={0.05} />
        <meshStandardMaterial attach="material-1" color="#2a2620" roughness={0.55} metalness={0.05} />
        <meshStandardMaterial attach="material-2" color="#2a2620" roughness={0.55} metalness={0.05} />
        <meshStandardMaterial attach="material-3" color="#2a2620" roughness={0.55} metalness={0.05} />
        <meshBasicMaterial attach="material-4" map={screenTexture} toneMapped={false} />
        <meshStandardMaterial attach="material-5" color="#2a2620" roughness={0.55} metalness={0.05} />
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

      {/* STAND NECK — sits flush against the case bottom (y=-0.225) and meets the base */}
      <mesh position={[0, -0.285, -0.05]}>
        <boxGeometry args={[0.4, 0.2, 0.34]} />
        <meshPhysicalMaterial
          color="#d8d2c0"
          metalness={0.1}
          roughness={0.6}
        />
      </mesh>

      {/* BASE — sits directly under the neck */}
      <RoundedBox
        args={[1.0, 0.1, 0.7]}
        radius={0.04}
        smoothness={6}
        position={[0, -0.435, -0.05]}
      >
        {caseMat}
      </RoundedBox>

      {/* Subtle ground shadow */}
      <mesh position={[0, -0.49, -0.05]} rotation={[-Math.PI / 2, 0, 0]}>
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
        camera={{ position: [0, 0.4, 4.0], fov: 38, near: 0.5, far: 50 }}
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
