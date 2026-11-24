"use client";

import * as THREE from "three";

// shared constants
export const COVER = "#3a4656";
export const PCB = "#1f7a3d";
export const PORT = "#0b0f14";

// one clickable front-face port; registers its Object3D so cables can anchor to it
export function Ports({ device, nodeId, registerPort, onPortClick, z, y, spread, selected }) {
  const ports = device.ports || [];
  const n = ports.length;
  if (!n) return null;
  const cols = Math.min(Math.max(n, 1), 8);
  return ports.map((p, i) => {
    const r = Math.floor(i / cols);
    const c = i % cols;
    const inRow = Math.min(cols, n - r * cols);
    const x = inRow <= 1 ? 0 : -spread / 2 + (c / (inRow - 1)) * spread;
    const yy = y - r * 0.2;
    const pw = Math.max(0.1, Math.min(0.24, (spread / Math.max(cols, 1)) * 0.62));
    return (
      <mesh
        key={p.id}
        position={[x, yy, z]}
        ref={(o) => registerPort(nodeId, p.id, o)}
        onClick={(e) => {
          e.stopPropagation();
          onPortClick(nodeId, p.id);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "auto";
        }}
      >
        <boxGeometry args={[pw, pw * 0.85, 0.12]} />
        <meshStandardMaterial
          color={selected ? "#3ea6ff" : PORT}
          emissive={selected ? "#123a5a" : "#0a0f14"}
          metalness={0.4}
          roughness={0.6}
        />
      </mesh>
    );
  });
}

export function Leds({ device, y, z, spread, count = 6 }) {
  const n = Math.min(count, device.ports.length || count);
  return Array.from({ length: n }).map((_, i) => {
    const x = n <= 1 ? 0 : -spread / 2 + (i / (n - 1)) * spread;
    return (
      <mesh key={i} position={[x, y, z]}>
        <boxGeometry args={[0.05, 0.05, 0.05]} />
        <meshStandardMaterial color="#3fb950" emissive="#3fb950" emissiveIntensity={1.4} />
      </mesh>
    );
  });
}
