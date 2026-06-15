import { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';

function FloatingParticles() {
  const particlesRef = useRef<THREE.Points>(null);

  useFrame((state) => {
    if (particlesRef.current) {
      // Rotate slowly over time, slightly altered by mouse position
      const targetRotationY = state.clock.elapsedTime * 0.03 + state.mouse.x * 0.1;
      const targetRotationX = state.clock.elapsedTime * 0.015 + state.mouse.y * 0.1;
      particlesRef.current.rotation.y = THREE.MathUtils.lerp(particlesRef.current.rotation.y, targetRotationY, 0.05);
      particlesRef.current.rotation.x = THREE.MathUtils.lerp(particlesRef.current.rotation.x, targetRotationX, 0.05);
    }
  });

  const particlesGeometry = new THREE.BufferGeometry();
  const particlesCount = 800;
  const posArray = new Float32Array(particlesCount * 3);

  for (let i = 0; i < particlesCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 12;
  }

  particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

  const particlesMaterial = new THREE.PointsMaterial({
    size: 0.025,
    color: 0xff69b4,
    transparent: true,
    opacity: 0.6,
  });

  return (
    <points ref={particlesRef} geometry={particlesGeometry} material={particlesMaterial} />
  );
}

function NeonSphere() {
  const sphereRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (sphereRef.current) {
      // Rotation combined with mouse influence
      sphereRef.current.rotation.y = state.clock.elapsedTime * 0.15 + state.mouse.x * 0.4;
      sphereRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.25) * 0.1 + state.mouse.y * 0.4;
      
      // Floating breath effect
      sphereRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.05;
    }
  });

  return (
    <mesh ref={sphereRef} position={[0, 0, 0]}>
      <sphereGeometry args={[1.5, 24, 24]} />
      <meshStandardMaterial
        color={0x00ffff}
        emissive={0x9400d3}
        emissiveIntensity={0.6}
        wireframe
      />
    </mesh>
  );
}

function FloatingArtworkFrames() {
  const groupRef = useRef<THREE.Group>(null);
  
  // Define positions for 3 floating wireframe/holographic panels
  const framePositions: [number, number, number][] = [
    [-3, 2, -4],
    [3.5, 0, -5],
    [-2.5, -3, -6],
    [3, -4, -3],
  ];

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.children.forEach((child, index) => {
        // Slow custom rotations per frame
        child.rotation.y = state.clock.elapsedTime * 0.1 * (index % 2 === 0 ? 1 : -1) + state.mouse.x * 0.2;
        child.rotation.x = state.clock.elapsedTime * 0.05 + state.mouse.y * 0.2;
        
        // Gentle individual floating movement
        child.position.y = framePositions[index][1] + Math.sin(state.clock.elapsedTime + index) * 0.15;
      });
    }
  });

  return (
    <group ref={groupRef}>
      {framePositions.map((pos, i) => (
        <mesh key={i} position={pos}>
          <boxGeometry args={[1.2, 1.8, 0.15]} />
          <meshStandardMaterial
            color={i % 2 === 0 ? 0xff69b4 : 0x39ff14}
            emissive={i % 2 === 0 ? 0xff69b4 : 0x00ffff}
            emissiveIntensity={0.4}
            wireframe
          />
        </mesh>
      ))}
    </group>
  );
}

function CameraController() {
  useFrame((state) => {
    // Parallax shift camera position downward based on user scroll height
    const scrollY = typeof window !== 'undefined' ? window.scrollY : 0;
    const targetY = -(scrollY * 0.006); // Shift speed multiplier
    
    // Smooth interpolation (lerp)
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, targetY, 0.08);
    
    // Add subtle camera drift based on mouse
    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, state.mouse.x * 1.5, 0.05);
    state.camera.lookAt(0, state.camera.position.y, -3);
  });
  
  return null;
}

function ThreeBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="fixed inset-0 -z-10 bg-[#020202]" />
    );
  }

  return (
    <div className="fixed inset-0 -z-10 bg-[#020202]">
      <Canvas camera={{ position: [0, 0, 5], fof: 75 }}>
        <color attach="background" args={['#030303']} />
        <ambientLight intensity={0.7} />
        <pointLight position={[10, 10, 10]} intensity={1.2} />
        <pointLight position={[-10, -10, -10]} intensity={0.8} color="#ff69b4" />
        <pointLight position={[0, 5, -5]} intensity={1} color="#00ffff" />
        <Stars radius={90} depth={40} count={3500} factor={4} saturation={0.5} fade speed={1.2} />
        <FloatingParticles />
        <NeonSphere />
        <FloatingArtworkFrames />
        <CameraController />
      </Canvas>
    </div>
  );
}

export default ThreeBackground;
