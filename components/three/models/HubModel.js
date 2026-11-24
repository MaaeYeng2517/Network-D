"use client";

import { Ports, Leds } from "./shared.js";

// generic hub (4-8 ports, simple box)
export default function HubModel({ device, nodeId, exploded, selected, registerPort, onPortClick, devColor }) {
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
      <Leds device={device} y={h * 0.62} z={d / 2 + 0.06} spread={w * 0.7} count={4} />
    </group>
  );
}
