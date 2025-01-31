'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

type WormholeCanvasProps = {
  intensity?: number;
};

const WormholeCanvas = ({ intensity = 0.3 }: WormholeCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.z = 50;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 1);

    const starGeometry = new THREE.BufferGeometry();
    const stars = 20000;
    const positions = new Float32Array(stars * 3);
    const starSpeeds = new Float32Array(stars);

    for (let i = 0; i < stars; i++) {
      const i3 = i * 3;
      const radius = 50 + Math.random() * 150;
      const theta = Math.random() * Math.PI * 2;
      
      positions[i3] = Math.cos(theta) * radius;
      positions[i3 + 1] = Math.sin(theta) * radius;
      positions[i3 + 2] = (Math.random() - 0.5) * 500;
      
      starSpeeds[i] = (Math.random() * 0.3 + 0.1) * intensity;
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const starMaterial = new THREE.PointsMaterial({
      size: 0.3,
      sizeAttenuation: true,
      color: 0xFFFFFF,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });

    const starField = new THREE.Points(starGeometry, starMaterial);
    scene.add(starField);

    function animate() {
      requestAnimationFrame(animate);
      const positions = starGeometry.attributes.position.array as Float32Array;

      for (let i = 0; i < stars; i++) {
        const i3 = i * 3;
        const x = positions[i3];
        const y = positions[i3 + 1];
        const distance = Math.sqrt(x * x + y * y);
        const speed = starSpeeds[i];

        if (distance > 0) {
          const angle = Math.atan2(y, x);
          positions[i3] = Math.cos(angle) * (distance + speed);
          positions[i3 + 1] = Math.sin(angle) * (distance + speed);
        }

        if (distance > 250) {
          const newRadius = 50 + Math.random() * 20;
          const newAngle = Math.random() * Math.PI * 2;
          positions[i3] = Math.cos(newAngle) * newRadius;
          positions[i3 + 1] = Math.sin(newAngle) * newRadius;
        }
      }

      starGeometry.attributes.position.needsUpdate = true;
      renderer.render(scene, camera);
    }

    animate();

    function handleResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      starGeometry.dispose();
      starMaterial.dispose();
    };
  }, [intensity]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full -z-10"
    />
  );
};

export default WormholeCanvas;