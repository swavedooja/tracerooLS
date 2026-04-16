import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Text, RoundedBox, Float } from '@react-three/drei';
import * as THREE from 'three';

/* ── colour palette per shape ─────────────────────────── */
const COLORS = {
  Box:     { base: '#4fc3f7', glass: '#0288d1' },
  Carton:  { base: '#ffb74d', glass: '#f57c00' },
  Bottle:  { base: '#81c784', glass: '#388e3c' },
  Pallet:  { base: '#8d6e63', glass: '#5d4037' },
};

/* ── Connector Line between levels ────────────────────── */
function Connector({ start, end }) {
  const points = useMemo(() => [new THREE.Vector3(...start), new THREE.Vector3(...end)], [start, end]);
  
  return (
    <line>
      <bufferGeometry attach="geometry" setFromPoints={points} />
      <lineBasicMaterial attach="material" color="#cbd5e1" linewidth={1} dashSize={0.2} gapSize={0.1} />
    </line>
  );
}

/* ── Ground Plane ─────────────────────────────────────── */
function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]} receiveShadow>
      <planeGeometry args={[50, 50]} />
      <meshStandardMaterial color="#f8fafc" opacity={0.5} transparent />
    </mesh>
  );
}

/* ── individual 3‑D shape (one packaging level) ───────── */
function PackageShape({ shapeType, scale, color, label, details, position }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      // Subtle float and rotate
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.05;
      meshRef.current.rotation.y += 0.005;
    }
  });

  const matProps = {
    color,
    roughness: 0.2,
    metalness: 0.1,
    envMapIntensity: 1,
  };

  const renderGeometry = () => {
    switch (shapeType) {
      case 'Bottle':
        return (
          <group ref={meshRef} position={position}>
            {/* Bottle body */}
            <mesh position={[0, -0.1, 0]} castShadow>
              <cylinderGeometry args={[scale * 0.25, scale * 0.3, scale * 1, 32]} />
              <meshPhysicalMaterial {...matProps} transmission={0.2} thickness={0.5} />
            </mesh>
            {/* Cap */}
            <mesh position={[0, scale * 0.5, 0]} castShadow>
              <cylinderGeometry args={[scale * 0.15, scale * 0.15, scale * 0.2, 16]} />
              <meshStandardMaterial color="#333" />
            </mesh>
          </group>
        );

      case 'Pallet':
        return (
          <group ref={meshRef} position={position}>
            {/* flat wooden base */}
            <mesh position={[0, -0.4, 0]} castShadow>
              <boxGeometry args={[scale * 1.4, scale * 0.12, scale * 1.1]} />
              <meshStandardMaterial color={color} roughness={0.9} />
            </mesh>
            {/* slats */}
            {[-0.3, 0, 0.3].map((z, i) => (
              <mesh key={i} position={[0, -0.3, z * scale]} castShadow>
                <boxGeometry args={[scale * 1.4, scale * 0.08, scale * 0.1]} />
                <meshStandardMaterial color="#5d4037" />
              </mesh>
            ))}
          </group>
        );

      case 'Carton':
      case 'Box':
      default:
        const isCarton = shapeType === 'Carton';
        return (
          <mesh ref={meshRef} position={position} castShadow>
            <RoundedBox 
               args={[scale, isCarton ? scale * 0.7 : scale, isCarton ? scale * 0.6 : scale]} 
               radius={0.05} 
               smoothness={4}
            >
              <meshStandardMaterial {...matProps} />
            </RoundedBox>
          </mesh>
        );
    }
  };

  return (
    <group>
      {renderGeometry()}
      
      {/* Top Label */}
      <Text
        position={[position[0], position[1] + scale * 0.8, position[2]]}
        fontSize={0.16}
        color="#1e293b"
        anchorX="center"
        fontWeight="bold"
      >
        {label}
      </Text>

      {/* Bottom Details */}
      <Text
        position={[position[0], position[1] - scale * 0.9, position[2]]}
        fontSize={0.12}
        color="#64748b"
        anchorX="center"
        maxWidth={2}
      >
        {details}
      </Text>
    </group>
  );
}

/* ── main scene content ───────────────────────────────── */
function Scene({ levels }) {
  const horizontalSpacing = 2.8;
  const startX = -((levels.length - 1) * horizontalSpacing) / 2;

  const shapes = useMemo(() => {
    return levels.map((lvl, idx) => {
      const shapeType = lvl.shapeType || 'Box';
      const pal = COLORS[shapeType] || COLORS.Box;
      
      // Normalized scaling: Bottle is slightly smaller, Pallet slightly larger
      let baseScale = 1.0;
      if (shapeType === 'Bottle') baseScale = 0.85;
      if (shapeType === 'Pallet') baseScale = 1.3;

      return {
        key: idx,
        shapeType,
        scale: baseScale,
        color: pal.base,
        label: lvl.levelName || `Level ${lvl.levelIndex}`,
        details: lvl.containedQuantity > 1 ? `Contains ${lvl.containedQuantity} units` : 'Base Unit',
        position: [startX + idx * horizontalSpacing, 0, 0],
      };
    });
  }, [levels, startX]);

  return (
    <>
      <color attach="background" args={['#f8fafc']} />
      <ambientLight intensity={0.5} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />
      
      <Environment preset="city" />

      {shapes.map((s, i) => (
        <React.Fragment key={s.key}>
          <PackageShape
            shapeType={s.shapeType}
            scale={s.scale}
            color={s.color}
            label={s.label}
            details={s.details}
            position={s.position}
          />
          {/* Connector to next level */}
          {i < shapes.length - 1 && (
            <Connector 
              start={[s.position[0] + 0.6, 0, 0]} 
              end={[shapes[i+1].position[0] - 0.6, 0, 0]} 
            />
          )}
        </React.Fragment>
      ))}

      <Ground />
      <ContactShadows position={[0, -1.45, 0]} opacity={0.4} scale={20} blur={2.5} far={4.5} />
      
      <OrbitControls 
        makeDefault 
        enablePan 
        enableZoom 
        minDistance={4} 
        maxDistance={12}
        maxPolarAngle={Math.PI / 2} 
      />
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
        color: '#94a3b8',
        background: '#f8fafc',
        fontFamily: 'Inter, sans-serif',
        borderRadius: 8,
      }}>
        Add packaging levels to see the hierarchy
      </div>
    );
  }

  return (
    <div style={{
      height: 440,
      width: '100%',
      borderRadius: 12,
      overflow: 'hidden',
      position: 'relative',
      border: '1px solid #e2e8f0',
      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    }}>
      {/* Legend / Title */}
      <div style={{
        position: 'absolute',
        top: 16,
        left: 16,
        zIndex: 10,
        pointerEvents: 'none',
      }}>
        <h4 style={{ margin: 0, color: '#1e293b', fontSize: 13, fontWeight: 700, fontFamily: 'Inter' }}>
          Visual Packaging Hierarchy
        </h4>
        <div style={{ fontSize: 11, color: '#64748b', marginTop: 2, fontFamily: 'Inter' }}>
          {levels.length} levels configured
        </div>
      </div>

      {/* Interaction Hint */}
      <div style={{
        position: 'absolute',
        bottom: 12,
        right: 16,
        zIndex: 10,
        fontSize: 10,
        color: '#94a3b8',
        background: 'rgba(255,255,255,0.7)',
        padding: '4px 8px',
        borderRadius: 4,
        fontFamily: 'Inter',
        pointerEvents: 'none',
      }}>
        🖱 Rotate · ↕ Zoom
      </div>

      <Canvas shadows camera={{ position: [0, 1.5, 7], fov: 35 }}>
        <Scene levels={levels} />
      </Canvas>
    </div>
  );
}
