import { Suspense, useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { RoundedBox, OrbitControls, Environment } from '@react-three/drei'
import * as THREE from 'three'


/**
 * A retro CRT monitor — auto-rotates continuously, drag to override.
 */
function Monitor() {
  const group = useRef<THREE.Group>(null)

  // Terminal screen texture — single centered line, terminal green.
  // Two versions: one with the cursor (_) and one with a trailing space so
  // the centered text stays in the exact same position when it blinks.
  const makeScreenTexture = (showCursor: boolean) => {
    const c = document.createElement('canvas')
    c.width = 1024
    c.height = 768
    const ctx = c.getContext('2d')!

    ctx.fillStyle = '#070a07'
    ctx.fillRect(0, 0, 1024, 768)

    ctx.fillStyle = 'rgba(95, 255, 142, 0.04)'
    for (let y = 0; y < 768; y += 4) {
      ctx.fillRect(0, y, 1024, 1)
    }

    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = '#7bff9c'
    ctx.font = "bold 62px 'Courier New', monospace"
    ctx.shadowColor = 'rgba(95, 255, 142, 0.55)'
    ctx.shadowBlur = 18
    // Same character count so monospace centering doesn't shift between frames
    ctx.fillText(showCursor ? "> hi i'm fabio _" : "> hi i'm fabio  ", 512, 384)

    const tex = new THREE.CanvasTexture(c)
    tex.colorSpace = THREE.SRGBColorSpace
    tex.anisotropy = 8
    tex.minFilter = THREE.LinearFilter
    tex.magFilter = THREE.LinearFilter
    return tex
  }

  const screenOn = useMemo(() => makeScreenTexture(true), [])
  const screenOff = useMemo(() => makeScreenTexture(false), [])
  const screenMatRef = useRef<THREE.MeshBasicMaterial>(null)

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    const showCursor = Math.floor(t / 0.55) % 2 === 0
    const target = showCursor ? screenOn : screenOff
    if (screenMatRef.current && screenMatRef.current.map !== target) {
      screenMatRef.current.map = target
      screenMatRef.current.needsUpdate = true
    }
  })

  // Slightly warm off-white case material — no iridescence (was shimmering
  // on the case edges during rotation).
  const caseMat = (
    <meshStandardMaterial
      color="#b8b7b0"
      metalness={0.12}
      roughness={0.5}
    />
  )

  const darkPlasticMat = (
    <meshStandardMaterial color="#2a2823" roughness={0.6} metalness={0.1} />
  )

  // PCB substrate texture (right side window): green board with subtle
  // copper traces — gives the window depth without needing 3D traces.
  const pcbTexture = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 512
    c.height = 512
    const ctx = c.getContext('2d')!

    // Green PCB base
    ctx.fillStyle = '#0c4a2a'
    ctx.fillRect(0, 0, 512, 512)

    // Subtle texture noise
    for (let i = 0; i < 800; i++) {
      ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.08})`
      ctx.fillRect(Math.random() * 512, Math.random() * 512, 1, 1)
    }

    // Copper traces — grid of thin lines
    ctx.strokeStyle = '#ffc266'
    ctx.lineWidth = 2
    ctx.globalAlpha = 0.5
    for (let y = 40; y < 512; y += 36) {
      ctx.beginPath()
      ctx.moveTo(20, y)
      ctx.lineTo(492, y)
      ctx.stroke()
    }
    for (let x = 40; x < 512; x += 36) {
      ctx.beginPath()
      ctx.moveTo(x, 20)
      ctx.lineTo(x, 492)
      ctx.stroke()
    }
    ctx.globalAlpha = 1

    // Through-hole "pads" — tiny circles at intersections
    ctx.fillStyle = '#d49350'
    for (let y = 40; y < 512; y += 36) {
      for (let x = 40; x < 512; x += 36) {
        if (Math.random() > 0.7) {
          ctx.beginPath()
          ctx.arc(x, y, 2.5, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    }

    const tex = new THREE.CanvasTexture(c)
    tex.colorSpace = THREE.SRGBColorSpace
    tex.anisotropy = 4
    return tex
  }, [])

  return (
    <group ref={group} position={[0, -0.5, 0]}>
      {/* MAIN CASE — BoxGeometry. Both side faces are fully transparent so we
          can build window cutouts on top with frame strips around the glass.
          Face order: 0=+X (right), 1=-X (left), 2=+Y, 3=-Y, 4=+Z, 5=-Z */}
      <mesh position={[0, 0.45, 0]}>
        <boxGeometry args={[1.6, 1.35, 1.25]} />
        <meshBasicMaterial attach="material-0" transparent opacity={0} depthWrite={false} />
        <meshBasicMaterial attach="material-1" transparent opacity={0} depthWrite={false} />
        <meshStandardMaterial attach="material-2" color="#b8b7b0" metalness={0.12} roughness={0.5} />
        <meshStandardMaterial attach="material-3" color="#b8b7b0" metalness={0.12} roughness={0.5} />
        <meshStandardMaterial attach="material-4" color="#b8b7b0" metalness={0.12} roughness={0.5} />
        <meshStandardMaterial attach="material-5" color="#b8b7b0" metalness={0.12} roughness={0.5} />
      </mesh>

      {/* === SIDE WINDOWS — bigger cutout with thinner frame + physical glass.
          Window cutout: case-local y ∈ [-0.475, 0.475], z ∈ [-0.45, 0.45]
          Frame strips: 0.1 tall top/bottom, 0.1 wide front/back === */}
      {[1, -1].map((side) => (
        <group key={`side-${side}`} position={[side * 0.8, 0.45, 0]}>
          {/* Top frame strip */}
          <mesh
            position={[side * 0.002, 0.575, 0]}
            rotation={[0, side > 0 ? Math.PI / 2 : -Math.PI / 2, 0]}
          >
            <planeGeometry args={[1.25, 0.2]} />
            <meshStandardMaterial color="#b8b7b0" metalness={0.12} roughness={0.5} side={THREE.DoubleSide} />
          </mesh>
          {/* Bottom frame strip */}
          <mesh
            position={[side * 0.002, -0.575, 0]}
            rotation={[0, side > 0 ? Math.PI / 2 : -Math.PI / 2, 0]}
          >
            <planeGeometry args={[1.25, 0.2]} />
            <meshStandardMaterial color="#b8b7b0" metalness={0.12} roughness={0.5} side={THREE.DoubleSide} />
          </mesh>
          {/* Front frame strip (z > window) */}
          <mesh
            position={[side * 0.002, 0, 0.525]}
            rotation={[0, side > 0 ? Math.PI / 2 : -Math.PI / 2, 0]}
          >
            <planeGeometry args={[0.2, 0.95]} />
            <meshStandardMaterial color="#b8b7b0" metalness={0.12} roughness={0.5} side={THREE.DoubleSide} />
          </mesh>
          {/* Back frame strip (z < window) */}
          <mesh
            position={[side * 0.002, 0, -0.525]}
            rotation={[0, side > 0 ? Math.PI / 2 : -Math.PI / 2, 0]}
          >
            <planeGeometry args={[0.2, 0.95]} />
            <meshStandardMaterial color="#b8b7b0" metalness={0.12} roughness={0.5} side={THREE.DoubleSide} />
          </mesh>
          {/* PHYSICAL GLASS PANEL — proper transmission with refraction */}
          <mesh
            position={[side * 0.001, 0, 0]}
            rotation={[0, side > 0 ? Math.PI / 2 : -Math.PI / 2, 0]}
          >
            <planeGeometry args={[0.85, 0.95]} />
            <meshPhysicalMaterial
              color="#eaf6ee"
              transmission={1}
              thickness={0.08}
              roughness={0.04}
              ior={1.5}
              clearcoat={1}
              clearcoatRoughness={0.02}
              specularIntensity={1}
              envMapIntensity={1.5}
              side={THREE.DoubleSide}
              transparent
            />
          </mesh>
        </group>
      ))}

      {/* === BACK SERVICE PANEL — removable rear cover with 4 corner screws === */}
      <RoundedBox
        args={[1.45, 1.15, 0.04]}
        radius={0.02}
        smoothness={4}
        position={[0, 0.45, -0.65]}
      >
        <meshStandardMaterial color="#a8a7a0" metalness={0.1} roughness={0.55} />
      </RoundedBox>
      {/* Four corner screws */}
      {[
        [-0.6, 0.85],
        [0.6, 0.85],
        [-0.6, 0.05],
        [0.6, 0.05],
      ].map(([sx, sy], i) => (
        <group key={`back-screw-${i}`}>
          {/* Screw head */}
          <mesh position={[sx, sy, -0.672]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.022, 0.022, 0.008, 16]} />
            <meshStandardMaterial color="#5a554a" metalness={0.6} roughness={0.4} />
          </mesh>
          {/* Slot line on the head */}
          <mesh position={[sx, sy, -0.677]} rotation={[0, 0, Math.PI / 3 + i * 0.5]}>
            <planeGeometry args={[0.008, 0.028]} />
            <meshBasicMaterial color="#2a2520" side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}

      {/* === INTERNALS — visible through the clear right side panel === */}
      <group position={[0, 0.45, 0]}>
        {/* CRT TUBE — large cone tapering from the screen (front) toward the
            electron gun at the back. Mostly opaque so it hides the back wall. */}
        <mesh position={[0, 0.08, 0.05]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.42, 1.0, 28, 1, true]} />
          <meshStandardMaterial
            color="#cfd6d2"
            roughness={0.25}
            metalness={0.4}
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* Tube back end-cap so it doesn't look hollow from behind */}
        <mesh position={[0, 0.08, -0.45]} rotation={[0, 0, 0]}>
          <circleGeometry args={[0.02, 16]} />
          <meshStandardMaterial color="#1a1a1a" side={THREE.DoubleSide} />
        </mesh>
        {/* DEFLECTION YOKE — copper coil around the tube neck */}
        <mesh position={[0, 0.08, -0.35]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.085, 0.04, 12, 28]} />
          <meshStandardMaterial color="#b06a32" metalness={0.6} roughness={0.45} />
        </mesh>
        {/* ELECTRON GUN — small black cylinder at the very back of the tube */}
        <mesh position={[0, 0.08, -0.5]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.038, 0.038, 0.12, 16]} />
          <meshStandardMaterial color="#1f1d1a" metalness={0.4} roughness={0.5} />
        </mesh>

        {/* MOTHERBOARD PCB — sits along the bottom of the case */}
        <mesh position={[0, -0.55, -0.05]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.3, 1.0]} />
          <meshStandardMaterial map={pcbTexture} roughness={0.7} metalness={0.15} side={THREE.DoubleSide} />
        </mesh>

        {/* CPU package — black with silver heat-spreader on top */}
        <mesh position={[-0.2, -0.51, 0.1]}>
          <boxGeometry args={[0.18, 0.04, 0.18]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.3} roughness={0.55} />
        </mesh>
        <mesh position={[-0.2, -0.488, 0.1]}>
          <boxGeometry args={[0.13, 0.005, 0.13]} />
          <meshStandardMaterial color="#c4c4c4" metalness={0.7} roughness={0.35} />
        </mesh>

        {/* CAPACITORS — vertical cylinders standing on the board */}
        {[
          { x: 0.25, z: 0.1, h: 0.14 },
          { x: 0.4, z: 0.0, h: 0.12 },
          { x: 0.15, z: -0.05, h: 0.16 },
          { x: 0.35, z: -0.18, h: 0.1 },
          { x: 0.1, z: 0.25, h: 0.1 },
        ].map((c, i) => (
          <group key={`cap-${i}`} position={[c.x, -0.55 + c.h / 2, c.z]}>
            <mesh>
              <cylinderGeometry args={[0.03, 0.03, c.h, 18]} />
              <meshStandardMaterial color="#6a6a6a" metalness={0.55} roughness={0.4} />
            </mesh>
            {/* Top X-mark */}
            <mesh position={[0, c.h / 2 + 0.001, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <planeGeometry args={[0.05, 0.004]} />
              <meshBasicMaterial color="#2a2a2a" />
            </mesh>
            <mesh position={[0, c.h / 2 + 0.001, 0]} rotation={[Math.PI / 2, 0, Math.PI / 2]}>
              <planeGeometry args={[0.05, 0.004]} />
              <meshBasicMaterial color="#2a2a2a" />
            </mesh>
          </group>
        ))}

        {/* Small ICs */}
        {[
          { x: -0.45, z: -0.1 },
          { x: -0.5, z: 0.15 },
          { x: 0.5, z: 0.2 },
        ].map((c, i) => (
          <mesh key={`ic-${i}`} position={[c.x, -0.523, c.z]}>
            <boxGeometry args={[0.08, 0.018, 0.06]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.5} />
          </mesh>
        ))}

        {/* Resistors */}
        {[
          { x: -0.05, z: 0.32, c: '#c47833' },
          { x: -0.05, z: -0.32, c: '#b04545' },
          { x: 0.55, z: -0.05, c: '#c47833' },
        ].map((r, i) => (
          <mesh key={`res-${i}`} position={[r.x, -0.523, r.z]}>
            <boxGeometry args={[0.06, 0.025, 0.022]} />
            <meshStandardMaterial color={r.c} roughness={0.6} />
          </mesh>
        ))}

        {/* POWER SUPPLY — chunky black box at the back-right */}
        <mesh position={[0.4, -0.32, -0.4]}>
          <boxGeometry args={[0.5, 0.4, 0.35]} />
          <meshStandardMaterial color="#2a2823" metalness={0.4} roughness={0.55} />
        </mesh>
        {/* Power supply vent slats */}
        {[-0.12, -0.04, 0.04, 0.12].map((dy, i) => (
          <mesh key={`psu-vent-${i}`} position={[0.65, -0.32 + dy, -0.4]} rotation={[0, Math.PI / 2, 0]}>
            <planeGeometry args={[0.25, 0.015]} />
            <meshBasicMaterial color="#0a0908" />
          </mesh>
        ))}

        {/* A green status LED on the PCB */}
        <mesh position={[-0.55, -0.515, 0.3]}>
          <sphereGeometry args={[0.012, 12, 12]} />
          <meshBasicMaterial color="#5fff8e" toneMapped={false} />
        </mesh>
      </group>

      {/* INNER BEZEL — modest lift so the bottom edge clears the controls */}
      <RoundedBox
        args={[1.35, 1.05, 0.05]}
        radius={0.08}
        smoothness={6}
        position={[0, 0.55, 0.62]}
      >
        <meshStandardMaterial
          color="#cfc8b6"
          metalness={0.08}
          roughness={0.6}
        />
      </RoundedBox>

      {/* SCREEN PANEL — meshBasicMaterial = no lighting, no specular, no
          per-frame shading variation. Pure texture display. The map swaps
          between cursor on/off textures via useFrame above for the blink. */}
      <mesh position={[0, 0.55, 0.7]} renderOrder={1}>
        <planeGeometry args={[1.2, 0.92]} />
        <meshBasicMaterial ref={screenMatRef} map={screenOn} toneMapped={false} />
      </mesh>

      {/* VENTILATION SLOTS on top — more of them, in two rows for depth */}
      {[-0.55, -0.4, -0.25, -0.1, 0.05, 0.2, 0.35, 0.5].map((x) => (
        <mesh key={`vent-front-${x}`} position={[x, 1.122, 0.15]}>
          <boxGeometry args={[0.08, 0.014, 0.4]} />
          {darkPlasticMat}
        </mesh>
      ))}
      {[-0.55, -0.4, -0.25, -0.1, 0.05, 0.2, 0.35, 0.5].map((x) => (
        <mesh key={`vent-back-${x}`} position={[x, 1.122, -0.32]}>
          <boxGeometry args={[0.08, 0.014, 0.2]} />
          {darkPlasticMat}
        </mesh>
      ))}

      {/* BRAND PLATE — nudged 3px out of the case face to avoid Z-fighting
          with the case front (was coplanar at z=0.625) */}
      <mesh position={[-0.45, -0.1, 0.628]}>
        <planeGeometry args={[0.3, 0.04]} />
        <meshStandardMaterial color="#9a9486" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* POWER LED + button on lower-right (also pushed forward to clear the
          case face) */}
      <group position={[0.55, -0.1, 0.632]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.04, 0.045, 0.012, 24]} />
          <meshStandardMaterial color="#3a3630" metalness={0.4} roughness={0.5} />
        </mesh>
        <mesh position={[0, 0, 0.008]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.013, 0.013, 0.004, 16]} />
          <meshBasicMaterial color="#5fff8e" toneMapped={false} />
        </mesh>
      </group>

      {/* STAND NECK — sits flush against the case bottom (y=-0.225) and meets the base */}
      <mesh position={[0, -0.285, -0.05]}>
        <boxGeometry args={[0.4, 0.2, 0.34]} />
        <meshPhysicalMaterial
          color="#a8a7a0"
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
      {/* Environment gives the glass something to reflect/refract. Hidden
          (background={false}) so it doesn't show as the scene background. */}
      <Environment preset="apartment" background={false} />
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
