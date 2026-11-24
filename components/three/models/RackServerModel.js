"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Ports } from "./shared.js";

const SERVER_CHASSIS = "#12151c";
const SERVER_BAY = "#1e222d";
const SERVER_VENT = "#090b0f";
const LED_BLUE = "#3b82f6";
const LED_VIOLET = "#a855f7";
const LED_ORANGE = "#f97316";
const LED_RED = "#ef4444";

// detailed 3D rack/dense server with heavy gunmetal + carbon-black palette
// LEDs pulse (violet drive I/O) / steady (blue power) via useFrame.
export default function RackServerModel({ device, nodeId, exploded, selected, registerPort, onPortClick, devColor }) {
  const { w, h, d } = device.dims;
  const e = exploded;
  const violetRefs = useRef([]);
  const blueRef = useRef();
  const orangeRef = useRef();
  const redRef = useRef();

  const chassis = devColor || SERVER_CHASSIS;
  const bayCount = 4;
  const frontZ = d / 2 + 0.012;

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    // violet drive activity: rapid pulse on every drive LED
    for (const r of violetRefs.current) {
      if (r) r.emissiveIntensity = 0.6 + (Math.sin(t * 6.0) * 0.5 + 0.5) * 2.2;
    }
    // blue power: steady with subtle breathing
    if (blueRef.current) {
      blueRef.current.emissiveIntensity = 1.4 + (Math.sin(t * 1.2) * 0.5 + 0.5) * 0.6;
    }
    // orange thermal: occasional warn blink
    if (orangeRef.current) {
      orangeRef.current.emissiveIntensity = 0.8 + (Math.sin(t * 2.0) > 0.6 ? 2.4 : 0.2);
    }
    // red critical: very slow blink
    if (redRef.current) {
      redRef.current.emissiveIntensity = 0.5 + (Math.sin(t * 0.8) > 0.4 ? 1.6 : 0.1);
    }
  });

  return (
    <group>
      {/* Chassis: heavy carbon-black rack body */}
      <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial
          color={selected ? "#1d2740" : chassis}
          metalness={0.65}
          roughness={0.5}
        />
      </mesh>

      {/* Top cover (exploded lift) */}
      <mesh position={[0, h + 0.04 + e * 1.0, 0]} castShadow>
        <boxGeometry args={[w * 1.01, 0.06, d * 1.01]} />
        <meshStandardMaterial color="#1e222d" metalness={0.6} roughness={0.45} />
      </mesh>

      {/* Front bezel frame */}
      <mesh position={[0, h * 0.5, d / 2 + 0.006]} castShadow>
        <boxGeometry args={[w * 0.98, h * 0.94, 0.02]} />
        <meshStandardMaterial color="#0b0f14" metalness={0.4} roughness={0.7} />
      </mesh>

      {/* Hot-swap drive bays (2 columns x 4 rows) */}
      {Array.from({ length: bayCount }).map((_, i) => {
        const cols = 2;
        const col = i % cols;
        const row = Math.floor(i / cols);
        const bw = w * 0.36;
        const bh = h * 0.13;
        const gapX = w * 0.04;
        const gapY = h * 0.02;
        const x = -w * 0.22 + col * (bw + gapX);
        const y = h * 0.78 - row * (bh + gapY) + e * 0.9 * (row + 1) * 0.35;
        return (
          <group key={i} position={[x, y, frontZ]}>
            <mesh castShadow>
              <boxGeometry args={[bw, bh, 0.05]} />
              <meshStandardMaterial color={SERVER_BAY} metalness={0.55} roughness={0.45} />
            </mesh>
            {/* drive handle groove */}
            <mesh position={[0, 0, 0.028]}>
              <boxGeometry args={[bw * 0.7, 0.012, 0.01]} />
              <meshStandardMaterial color="#0b0f14" metalness={0.3} roughness={0.8} />
            </mesh>
            {/* activity LED (violet) */}
            <mesh position={[bw * 0.36, bh * 0.28, 0.032]}>
              <boxGeometry args={[0.035, 0.035, 0.012]} />
              <meshStandardMaterial ref={i === 0 ? violetRef : undefined} color={LED_VIOLET} emissive={LED_VIOLET} emissiveIntensity={1.8} />
            </mesh>
          </group>
        );
      })}

      {/* Power / health LED strip (blue, steady) */}
      <mesh position={[-w * 0.22, h * 0.1, frontZ + 0.02]}>
        <boxGeometry args={[0.05, 0.05, 0.02]} />
        <meshStandardMaterial ref={blueRef} color={LED_BLUE} emissive={LED_BLUE} emissiveIntensity={1.6} />
      </mesh>

      {/* Thermal / CPU warning (orange) */}
      <mesh position={[0, h * 0.1, frontZ + 0.02]}>
        <boxGeometry args={[0.05, 0.05, 0.02]} />
        <meshStandardMaterial ref={orangeRef} color={LED_ORANGE} emissive={LED_ORANGE} emissiveIntensity={0.8} />
      </mesh>

      {/* Critical / PSU fault (red) */}
      <mesh position={[w * 0.22, h * 0.1, frontZ + 0.02]}>
        <boxGeometry args={[0.05, 0.05, 0.02]} />
        <meshStandardMaterial ref={redRef} color={LED_RED} emissive={LED_RED} emissiveIntensity={0.5} />
      </mesh>

      {/* Perforated vent grille (near-black, high roughness) */}
      <group position={[0, h * 0.9 - 0.02, d / 2 + 0.004]}>
        {Array.from({ length: 7 }).map((_, i) => {
          const x = -w * 0.4 + (i / 6) * w * 0.8;
          return (
            <mesh key={i} position={[x, 0, 0]}>
              <boxGeometry args={[0.02, 0.1, 0.015]} />
              <meshStandardMaterial color={SERVER_VENT} metalness={0.2} roughness={0.85} />
            </mesh>
          );
        })}
      </group>

      {/* Side vent grilles */}
      {[-1, 1].map((sx) => (
        <group key={sx} position={[(sx * w) / 2 + sx * 0.002, h * 0.5, 0]}>
          {Array.from({ length: 5 }).map((_, i) => (
            <mesh key={i} position={[0, h * 0.3 - i * h * 0.12, 0]}>
              <boxGeometry args={[0.015, 0.02, d * 0.7]} />
              <meshStandardMaterial color={SERVER_VENT} metalness={0.2} roughness={0.85} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Rear I/O panel */}
      <mesh position={[0, h * 0.5, -d / 2 - 0.006]}>
        <boxGeometry args={[w * 0.9, h * 0.3, 0.02]} />
        <meshStandardMaterial color="#0b0f14" metalness={0.4} roughness={0.7} />
      </mesh>

      {/* Front-facing ports (RJ45) */}
      <Ports
        device={device}
        nodeId={nodeId}
        registerPort={registerPort}
        onPortClick={onPortClick}
        z={d / 2 + 0.05}
        y={h * 0.2}
        spread={w * 0.7}
        selected={selected}
      />

      {/* Rack ears / mounting flanges */}
      {[-1, 1].map((sx) => (
        <mesh key={sx} position={[(sx * (w + 0.08)) / 2, h * 0.5, 0]} castShadow>
          <boxGeometry args={[0.08, h * 0.9, d * 0.9]} />
          <meshStandardMaterial color="#1a2531" metalness={0.6} roughness={0.5} />
        </mesh>
      ))}

      {/* Feet */}
      {[
        [-w * 0.35, -d * 0.3],
        [w * 0.35, -d * 0.3],
        [-w * 0.35, d * 0.3],
        [w * 0.35, d * 0.3],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.02, z]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 0.04, 12]} />
          <meshStandardMaterial color="#0f141a" metalness={0.15} roughness={0.95} />
        </mesh>
      ))}
    </group>
  );
}
