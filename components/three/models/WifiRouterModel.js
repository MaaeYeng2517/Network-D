"use client";

import { Ports } from "./shared.js";

// access point / wi-fi router: cylindrical body + dome
export default function WifiRouterModel({ device, nodeId, exploded, selected, registerPort, onPortClick, devColor }) {
  const { w, h, d } = device.dims;
  const e = exploded;
  const body = devColor || "#2b3746";
  const r = w / 2;
  return (
    <group>
      <mesh position={[0, h * 0.28, 0]} castShadow>
        <cylinderGeometry args={[r, r, h * 0.55, 24]} />
        <meshStandardMaterial color={selected ? "#34506b" : body} metalness={0.4} roughness={0.5} />
      </mesh>
      <mesh position={[0, h * 0.55 + 0.12 + e * 0.9, 0]} castShadow>
        <sphereGeometry args={[r, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#3a4656" metalness={0.5} roughness={0.4} />
      </mesh>
      <Ports
        device={device}
        nodeId={nodeId}
        registerPort={registerPort}
        onPortClick={onPortClick}
        z={r + 0.02}
        y={h * 0.2}
        spread={w * 0.6}
        selected={selected}
      />
    </group>
  );
}
