"use client";

import { Ports, Leds } from "./shared.js";

// generic switch / hub / firewall / gateway / modem
export function BoxModel({ device, nodeId, exploded, selected, registerPort, onPortClick, devColor }) {
  const { w, h, d } = device.dims;
  const e = exploded;
  const body = devColor || "#2b3746";
  return (
    <group>
      <mesh position={[0, h * 0.45, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, h * 0.9, d]} />
        <meshStandardMaterial color={selected ? "#34506b" : body} metalness={0.55} roughness={0.45} />
      </mesh>
      <mesh position={[0, h * 0.9 + e * 1.2, 0]} castShadow>
        <boxGeometry args={[w, h * 0.12, d]} />
        <meshStandardMaterial color="#3a4656" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0, h * 0.5 + e * 0.6, 0]} castShadow receiveShadow>
        <boxGeometry args={[w * 0.8, 0.05, d * 0.78]} />
        <meshStandardMaterial color="#1f7a3d" metalness={0.3} roughness={0.7} />
      </mesh>
      <Ports
        device={device}
        nodeId={nodeId}
        registerPort={registerPort}
        onPortClick={onPortClick}
        z={d / 2 + 0.06}
        y={h * 0.42}
        spread={w * 0.78}
        selected={selected}
      />
      <Leds device={device} y={h * 0.62} z={d / 2 + 0.06} spread={w * 0.7} count={5} />
    </group>
  );
}

// laptop: base + angled screen
export function LaptopModel({ device, nodeId, exploded, selected, registerPort, onPortClick, devColor }) {
  const { w, h, d } = device.dims;
  const e = exploded;
  const body = devColor || "#2b3746";
  const screenH = 1.1;
  return (
    <group>
      <mesh position={[0, 0.04, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, 0.08, d]} />
        <meshStandardMaterial color={selected ? "#34506b" : body} metalness={0.5} roughness={0.5} />
      </mesh>
      <group position={[0, 0.08, -d / 2]} rotation={[-Math.PI / 2 + 0.32 - e * 0.5, 0, 0]}>
        <mesh position={[0, screenH / 2, 0]} castShadow>
          <boxGeometry args={[w, screenH, 0.05]} />
          <meshStandardMaterial color="#141c26" metalness={0.4} roughness={0.5} />
        </mesh>
        <mesh position={[0, screenH / 2, 0.03]}>
          <planeGeometry args={[w * 0.9, screenH * 0.9]} />
          <meshStandardMaterial color="#0e2a3f" emissive="#0a1a2a" emissiveIntensity={0.6} />
        </mesh>
      </group>
      <Ports
        device={device}
        nodeId={nodeId}
        registerPort={registerPort}
        onPortClick={onPortClick}
        z={d / 2 + 0.05}
        y={0.04}
        spread={w * 0.7}
        selected={selected}
      />
    </group>
  );
}

// internet / cloud
export function CloudModel({ device, nodeId, exploded, selected, registerPort, onPortClick, devColor }) {
  const puffs = [
    [-0.6, 0, 0, 0.6],
    [0.6, 0, 0, 0.6],
    [0, 0.25, 0, 0.75],
    [-0.3, -0.1, 0.2, 0.5],
    [0.3, -0.1, -0.2, 0.5],
  ];
  return (
    <group>
      {puffs.map(([x, y, z, s], i) => (
        <mesh key={i} position={[x, y, z]} scale={s} castShadow>
          <sphereGeometry args={[0.6, 16, 12]} />
          <meshStandardMaterial color={selected ? "#9fe0ff" : "#cdd7e2"} metalness={0.1} roughness={0.6} />
        </mesh>
      ))}
      <mesh position={[0, -0.55, 0]} castShadow>
        <boxGeometry args={[1.2, 0.25, 0.8]} />
        <meshStandardMaterial color={devColor || "#2b3746"} metalness={0.4} roughness={0.6} />
      </mesh>
      <Ports
        device={device}
        nodeId={nodeId}
        registerPort={registerPort}
        onPortClick={onPortClick}
        z={0.45}
        y={-0.55}
        spread={0.8}
        selected={selected}
      />
    </group>
  );
}
