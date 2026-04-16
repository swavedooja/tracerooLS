import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Text, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

/* ── colour palette per shape ─────────────────────────── */
const COLORS = {
  Box:     { base: '#4fc3f7', glass: '#4fc3f7' },
  Carton:  { base: '#ffb74d', glass: '#ffb74d' },
  Bottle:  { base: '#81c784', glass: '#81c784' },
  Pallet:  { base: '#8d6e63', glass: '#8d6e63' },
};

/* ── individual 3‑D shape (one packaging level) ───────── */
function PackageShape({ shapeType, scale, opacity, color, label, position }) {
  const meshRef = useRef();

  useFrame((_, delta) => {
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.15;
  });

  const matProps = {
    color,
    transparent: true,
    opacity,
    roughness: 0.15,
    metalness: 0.1,
    side: THREE.DoubleSide,
  };

  const renderGeometry = () => {
    switch (shapeType) {
      case 'Bottle':
        return (
          <mesh ref={meshRef} position={position}>
            <cylinderGeometry args={[scale * 0.28, scale * 0.32, scale * 1.1, 32]} />
            <meshPhysicalMaterial {...matProps} />
          </mesh>
        );

      case 'Pallet':
        return (
          <group position={position}>
            {/* flat wooden base */}
            <mesh ref={meshRef} position={[0, -0.05, 0]}>
              <boxGeometry args={[scale * 1.6, scale * 0.15, scale * 1.2]} />
              <meshStandardMaterial color={color} roughness={0.85} />
            </mesh>
            {/* slat lines */}
            {[-0.35, 0, 0.35].map((z, i) => (
              <mesh key={i} position={[0, -0.15, z * scale]}>
                <boxGeometry args={[scale * 0.15, scale * 0.1, scale * 1.2]} />
                <meshStandardMaterial color="#5d4037" roughness={0.9} />
              </mesh>
            ))}
          </group>
        );

      case 'Carton':
        return (
          <mesh ref={meshRef} position={position}>
            <boxGeometry args={[scale, scale * 0.75, scale * 0.65]} />
            <meshPhysicalMaterial {...matProps} />
          </mesh>
        );

      case 'Box':
      default:
        return (
          <mesh ref={meshRef} position={position}>
            <boxGeometry args={[scale * 0.85, scale * 0.85, scale * 0.85]} />
            <meshPhysicalMaterial {...matProps} />
          </mesh>
        );
    }
  };

  return (
    <group>
      {renderGeometry()}
      <Text
        position={[position[0], position[1] + (shapeType === 'Pallet' ? 0.3 : scale * 0.55 + 0.15), position[2]]}
        fontSize={0.18}
        color="#222"
        anchorX="center"
        anchorY="middle"
        font={undefined}
      >
        {label}
      </Text>
    </group>
  );
}

/* ── floating label badge ─────────────────────────────── */
function InfoBadge({ text, position }) {
  return (
    <Text
      position={position}
      fontSize={0.12}
      color="#666"
      anchorX="center"
      anchorY="middle"
    >
      {text}
    </Text>
  );
}

/* ── main scene content ───────────────────────────────── */
function Scene({ levels }) {
  /* Build shapes from outermost (last) to innermost (first).
     Each successive inner level is rendered smaller & more opaque,
     placed centrally so it appears "inside" the outer package.   */
  const shapes = useMemo(() => {
    if (!levels || levels.length === 0) return [];

    return levels.map((lvl, idx) => {
      const outerIndex = levels.length - 1 - idx;        // outer = big
      const scale = 0.6 + outerIndex * 0.55;             // outer bigger
      const opacity = idx === 0 ? 0.95 : 0.25 + idx * 0.08; // inner opaque, outer glass
      const shapeType = lvl.shapeType || 'Box';
      const pal = COLORS[shapeType] || COLORS.Box;

      return {
        key: idx,
        shapeType,
        scale,
        opacity,
        color: pal.base,
        label: lvl.levelName || `Level ${lvl.levelIndex}`,
        qty: lvl.containedQuantity,
        position: [0, 0, 0],
      };
    });
  }, [levels]);

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[8, 10, 5]} intensity={1.2} castShadow />
      <directionalLight position={[-5, 5, -5]} intensity={0.4} />

      {/* render shapes – outermost first so transparency layering looks right */}
      {shapes.map((s) => (
        <PackageShape
          key={s.key}
          shapeType={s.shapeType}
          scale={s.scale}
          opacity={s.opacity}
          color={s.color}
          label={s.label}
          position={s.position}
        />
      ))}

      <ContactShadows position={[0, -1.5, 0]} opacity={0.35} scale={8} blur={2.5} far={4} />
      <OrbitControls makeDefault enablePan enableZoom minDistance={3} maxDistance={15} />
    </>
  );
}

/* ── public component ─────────────────────────────────── */
export default function Packaging3DView({ levels = [] }) {
  if (!levels || levels.length === 0) {
    return (
      <div style={{
        height: 400,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#999',
        fontFamily: 'Inter, sans-serif',
      }}>
        Add packaging levels to see the 3D visualization
      </div>
    );
  }

  return (
    <div style={{
      height: 420,
      width: '100%',
      background: 'linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 100%)',
      borderRadius: 8,
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Legend */}
      <div style={{
        position: 'absolute',
        top: 8,
        left: 8,
        zIndex: 10,
        background: 'rgba(255,255,255,0.85)',
        borderRadius: 6,
        padding: '6px 10px',
        fontSize: 11,
        lineHeight: '18px',
        fontFamily: 'Inter, sans-serif',
        boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
      }}>
        {levels.slice().reverse().map((l, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{
              display: 'inline-block',
              width: 10,
              height: 10,
              borderRadius: 2,
              background: (COLORS[l.shapeType] || COLORS.Box).base,
            }} />
            <span>{l.levelName} ({l.shapeType || 'Box'})</span>
          </div>
        ))}
      </div>

      {/* Drag hint */}
      <div style={{
        position: 'absolute',
        bottom: 8,
        right: 12,
        zIndex: 10,
        fontSize: 10,
        color: '#94a3b8',
        fontFamily: 'Inter, sans-serif',
      }}>
        🖱 Drag to rotate · Scroll to zoom
      </div>

      <Canvas camera={{ position: [0, 2.5, 6], fov: 45 }}>
        <Scene levels={levels} />
      </Canvas>
    </div>
  );
}
