"use client";

import * as THREE from "three";

// ================= Network Switch (16/24/48-port, 1U rack) =================
export default function SwitchModel({ device, nodeId, exploded, selected, registerPort, onPortClick, devColor }) {
  const { w, h, d } = device.dims;
  const e = exploded;
  const ports = device.ports || [];
  const rj45 = ports.filter((p) => /^Gi/.test(p.id));
  const uplink = ports.find((p) => p.id === "Uplink");
  const consoleP = ports.find((p) => p.id === "Console");
  const portCount = rj45.length || 24;
  const is24 = portCount >= 24;

  const chassisColor = selected ? "#1d2740" : devColor || (is24 ? "#172030" : "#263244");
  const stripeColor = is24 ? "#6366f1" : "#38bdf8";
  const activeLed = is24 ? "#00f0ff" : "#10b981";

  const cols = Math.max(1, Math.ceil(portCount / 2));
  const gapX = (w * 0.68) / cols;
  const portW = Math.min(0.16, gapX * 0.68);
  const portH = h * 0.24;
  const startX = -w * 0.4;
  const frontZ = d / 2 + 0.02;

  const ledStatus = (i) => {
    const r = (i * 37 + 13) % 10;
    if (r < 2) return { color: "#334155", intensity: 0.0 };
    if (r < 3) return { color: "#f59e0b", intensity: 1.8 };
    return { color: activeLed, intensity: 1.8 };
  };

  return (
    <group>
      {/* Chassis */}
      <mesh position={[0, h * 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial
          color={chassisColor}
          metalness={is24 ? 0.8 : 0.65}
          roughness={is24 ? 0.32 : 0.42}
        />
      </mesh>

      {/* Top cover (exploded lift) */}
      <mesh position={[0, h + 0.03 + e * 0.9, 0]} castShadow>
        <boxGeometry args={[w * 1.01, 0.05, d * 1.01]} />
        <meshStandardMaterial color="#1e222d" metalness={0.7} roughness={0.4} />
      </mesh>

      {/* Rack ears */}
      {[-1, 1].map((sx) => (
        <mesh key={sx} position={[(sx * (w + 0.16)) / 2, h * 0.5, d / 2 - 0.03]} castShadow>
          <boxGeometry args={[0.16, h * 0.9, 0.05]} />
          <meshStandardMaterial color={chassisColor} metalness={0.8} roughness={0.32} />
        </mesh>
      ))}

      {/* Tier accent stripe (left) */}
      <mesh position={[-w * 0.46, h * 0.5, d / 2 + 0.006]}>
        <boxGeometry args={[0.05, h * 0.6, 0.02]} />
        <meshStandardMaterial color={stripeColor} emissive={stripeColor} emissiveIntensity={0.6} />
      </mesh>

      {/* RJ45 ports (2 rows) + per-port LEDs */}
      {rj45.map((p, i) => {
        const col = Math.floor(i / 2);
        const row = i % 2;
        const groupOffset = Math.floor(col / 4) * 0.05;
        const x = startX + col * gapX + groupOffset;
        const y = row === 0 ? h * 0.66 : h * 0.34;
        const st = ledStatus(i);
        return (
          <group key={p.id} position={[x, y, frontZ]}>
            <mesh
              ref={(o) => registerPort(nodeId, p.id, o)}
              onClick={(ev) => {
                ev.stopPropagation();
                onPortClick(nodeId, p.id);
              }}
              onPointerOver={(ev) => {
                ev.stopPropagation();
                document.body.style.cursor = "pointer";
              }}
              onPointerOut={() => {
                document.body.style.cursor = "auto";
              }}
            >
              <boxGeometry args={[portW, portH, 0.06]} />
              <meshStandardMaterial color="#0f172a" metalness={0.4} roughness={0.6} />
            </mesh>
            <mesh position={[0, row === 0 ? portH * 0.8 : -portH * 0.8, 0.012]}>
              <boxGeometry args={[portW * 0.5, 0.02, 0.02]} />
              <meshStandardMaterial color={st.color} emissive={st.color} emissiveIntensity={st.intensity} />
            </mesh>
          </group>
        );
      })}

      {/* SFP+ uplink cages (4); first is the clickable Uplink */}
      {[0, 1, 2, 3].map((s) => {
        const sc = s % 2;
        const sr = Math.floor(s / 2);
        const x = w * 0.36 + sc * 0.14;
        const y = h * 0.66 - sr * h * 0.32;
        const clickable = s === 0 && uplink;
        return (
          <mesh
            key={s}
            position={[x, y, frontZ]}
            ref={clickable ? (o) => registerPort(nodeId, "Uplink", o) : undefined}
            onClick={
              clickable
                ? (ev) => {
                    ev.stopPropagation();
                    onPortClick(nodeId, "Uplink");
                  }
                : undefined
            }
          >
            <boxGeometry args={[0.12, portH, 0.07]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.25} />
          </mesh>
        );
      })}

      {/* Console port */}
      {consoleP && (
        <mesh
          position={[w * 0.36, h * 0.34, frontZ]}
          ref={(o) => registerPort(nodeId, "Console", o)}
          onClick={(ev) => {
            ev.stopPropagation();
            onPortClick(nodeId, "Console");
          }}
        >
          <boxGeometry args={[0.12, portH, 0.07]} />
          <meshStandardMaterial color="#475569" metalness={0.6} roughness={0.4} />
        </mesh>
      )}
    </group>
  );
}
