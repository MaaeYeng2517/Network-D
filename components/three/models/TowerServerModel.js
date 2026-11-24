"use client";

import { Ports } from "./shared.js";

// desktop tower
export default function TowerServerModel({ device, nodeId, exploded, selected, registerPort, onPortClick, devColor }) {
  const { w, h, d } = device.dims;
  const e = exploded;
  const body = devColor || "#2b3746";
  return (
    <group>
      <mesh position={[0, 0.05, 0]} receiveShadow>
        <boxGeometry args={[w * 1.5, 0.1, d * 1.3]} />
        <meshStandardMaterial color="#1a2531" metalness={0.4} roughness={0.7} />
      </mesh>
      <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color={selected ? "#34506b" : body} metalness={0.5} roughness={0.5} />
      </mesh>
      <mesh position={[0, h + 0.04 + e * 1.0, 0]} castShadow>
        <boxGeometry args={[w, 0.08, d]} />
        <meshStandardMaterial color="#3a4656" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0, h * 0.5 + e * 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[w * 0.82, h * 0.5, d * 0.82]} />
        <meshStandardMaterial color="#1f7a3d" metalness={0.3} roughness={0.7} />
      </mesh>
      <Ports
        device={device}
        nodeId={nodeId}
        registerPort={registerPort}
        onPortClick={onPortClick}
        z={d / 2 + 0.06}
        y={h * 0.2}
        spread={w * 0.7}
        selected={selected}
      />
    </group>
  );
}
