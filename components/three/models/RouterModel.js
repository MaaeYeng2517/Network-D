"use client";

import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry";

// ================= Router (detailed, engineering-proportioned) =================

// ปุ่มยาง 4 มุมด้านล่าง ยกตัวเครื่องให้ลอยจากพื้นเล็กน้อยเกิดเงาใต้เครื่อง
function RouterFeet({ w, h, d }) {
  const r = 0.05, hh = 0.045;
  const ix = w * 0.13, iz = d * 0.13;
  const y = -h / 2 - hh / 2;
  return (
    <group>
      {[
        [-ix, -iz], [ix, -iz], [-ix, iz], [ix, iz],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, y, z]} castShadow receiveShadow>
          <cylinderGeometry args={[r, r, hh, 12]} />
          <meshStandardMaterial color="#0f141a" metalness={0.15} roughness={0.95} />
        </mesh>
      ))}
    </group>
  );
}

// แถบไฟสถานะด้านหน้า: Power -> WAN -> WiFi 2.4G/5G -> LAN 1-4
// วาง Mesh ไฟ LED ยื่นออกจากผิวหน้า 0.006 เพื่อป้องกัน Z-fighting
function RouterLeds({ w, h, d, count = 7 }) {
  const ledW = 0.07, ledH = 0.035, ledD = 0.007;
  const spread = w * 0.72;
  const y = h / 2 - 0.11;
  const colors = ["#ff5252", "#4da6ff", "#6ee7b7", "#6ee7b7", "#4da6ff", "#4da6ff", "#4da6ff"];
  return (
    <group>
      {Array.from({ length: count }).map((_, i) => {
        const x = count <= 1 ? 0 : -spread / 2 + (i / (count - 1)) * spread;
        const color = colors[i % colors.length];
        return (
          <mesh key={i} position={[x, y, d / 2 + 0.006]} castShadow>
            <boxGeometry args={[ledW, ledH, ledD]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.6} />
          </mesh>
        );
      })}
    </group>
  );
}

// โลโก้แบรนด์แบบนูนต่ำ (emboss) ตรงกลางด้านหน้า
function RouterLogo({ w, h, d }) {
  const lw = w * 0.26, lh = 0.055, ld = 0.02;
  return (
    <mesh position={[0, h / 2 - lh / 2 - 0.06, d / 2 + 0.007]} castShadow>
      <primitive object={new RoundedBoxGeometry(lw, lh, ld, 0.01, 4)} />
      <meshStandardMaterial color="#94a3b8" metalness={0.75} roughness={0.25} />
    </mesh>
  );
}

// ร่องระบายอากาศด้านหน้า (ตามร่องต่อฝาบน/ฝาล่าง) ทำเป็นร่องเว้าสีดำสนิท
function RouterFrontVent({ w, d, y, count = 5 }) {
  const slotW = w * 0.6, slotH = 0.018, slotD = 0.05;
  const spread = w * 0.5;
  return (
    <group position={[0, y, d / 2 - slotD / 2 - 0.002]}>
      {Array.from({ length: count }).map((_, i) => {
        const x = count <= 1 ? 0 : -spread / 2 + (i / (count - 1)) * spread;
        return (
          <mesh key={i} position={[x, 0, 0]} castShadow>
            <boxGeometry args={[slotW, slotH, slotD]} />
            <meshStandardMaterial color="#050a0e" metalness={0.2} roughness={0.95} />
          </mesh>
        );
      })}
    </group>
  );
}

// พอร์ต RJ45 เดี่ยว: กรอบสี (WAN=n้ำเงิน, LAN=เทา), รูรีสเซส, ไฟสถานะ 2 ดวงมุมบน
function Rj45Port({ x, y, z, wan = false, nodeId, portId, registerPort }) {
  const pw = 0.2, ph = 0.15, pd = 0.12;
  const frame = wan ? "#2563eb" : "#475569";
  return (
    <group position={[x, y, z - pd / 2 - 0.01]}>
      <mesh castShadow>
        <boxGeometry args={[pw, ph, pd]} />
        <meshStandardMaterial color={frame} metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0, -pd / 2 + 0.02]}>
        <boxGeometry args={[pw * 0.78, ph * 0.78, 0.04]} />
        <meshStandardMaterial color="#0b0f14" metalness={0.25} roughness={0.9} />
      </mesh>
      <mesh position={[pw * 0.3, ph * 0.34, -pd / 2 + 0.005]} castShadow>
        <boxGeometry args={[0.03, 0.03, 0.012]} />
        <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={1.4} />
      </mesh>
      <mesh position={[-pw * 0.3, ph * 0.34, -pd / 2 + 0.005]} castShadow>
        <boxGeometry args={[0.03, 0.03, 0.012]} />
        <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={1.4} />
      </mesh>
      <mesh
        ref={(o) => registerPort(nodeId, portId, o)}
        position={[0, 0, -pd / 2 + 0.008]}
      >
        <boxGeometry args={[pw * 0.55, ph * 0.55, 0.015]} />
        <meshBasicMaterial color="transparent" />
      </mesh>
    </group>
  );
}

// ขั้วต่อไฟ DC (รูกลม + แกนเข็มตรงกลาง)
function DcJack({ x, y }) {
  return (
    <group position={[x, y, 0]}>
      <mesh position={[0, 0, -0.02]} castShadow>
        <ringGeometry args={[0.06, 0.095, 32]} />
        <mesh rotation={[Math.PI / 2, 0, 0]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0, -0.045]} castShadow>
        <cylinderGeometry args={[0.025, 0.025, 0.05, 12]} />
        <meshStandardMaterial color="#888" metalness={0.7} roughness={0.3} />
      </mesh>
    </group>
  );
}

// ปุ่ม Power (สี่เหลี่ยมขนาดใหญ่, ยื่นออกจากผิวด้านหลัง)
function PowerButton({ x, y }) {
  return (
    <mesh position={[x, y, -0.01]} castShadow>
      <boxGeometry args={[0.11, 0.07, 0.03]} />
      <meshStandardMaterial color="#e2e8f0" metalness={0.4} roughness={0.5} />
    </mesh>
  );
}

// ปุ่ม WPS / Wi-Fi (วงกลมขนาดเล็ก)
function WpsButton({ x, y }) {
  return (
    <mesh position={[x, y, -0.008]} castShadow>
      <cylinderGeometry args={[0.045, 0.045, 0.025, 16]} />
      <meshStandardMaterial color="#94a3b8" metalness={0.5} roughness={0.5} />
    </mesh>
  );
}

// ปุ่ม Reset (รูเข็มจมลึกเข้าไปในตัวเครื่อง)
function ResetButton({ x, y }) {
  return (
    <mesh position={[x, y, 0.018]} castShadow>
      <cylinderGeometry args={[0.022, 0.022, 0.05, 12]} />
      <meshStandardMaterial color="#0b0f14" metalness={0.2} roughness={0.9} />
    </mesh>
  );
}

// ตะแกรงระบายความร้อนด้านหลัง (ซี่แนวนอน, แก้ด้วยสีดำด้านแทนการเจาะรูจริงเพื่อประหยัด polygon)
function RearVents({ w, h }) {
  const rows = 3, cols = 6;
  const slotW = 0.14, slotH = 0.018, slotD = 0.03;
  const xSpread = w * 0.72, ySpread = h * 0.42;
  return (
    <group position={[0, h * 0.16, 0.01]}>
      {Array.from({ length: rows }).flatMap((_, r) =>
        Array.from({ length: cols }).map((_, c) => {
          const x = cols <= 1 ? 0 : -xSpread / 2 + (c / (cols - 1)) * xSpread;
          const yy = rows <= 1 ? 0 : -ySpread / 2 + (r / (rows - 1)) * ySpread;
          return (
            <mesh key={`${r}-${c}`} position={[x, yy, 0]} castShadow>
              <boxGeometry args={[slotW, slotH, slotD]} />
              <meshStandardMaterial color="#050a0e" metalness={0.2} roughness={0.95} />
            </mesh>
          );
        })
      )}
    </group>
  );
}

// เสาอากาศ Paddle: จุดหมุน (origin) ของ Group อยู่ที่ฐานข้อต่อ SMA หมุนพับได้
function RouterAntenna({ x, y }) {
  return (
    <group position={[x, y, 0.02]}>
      <mesh position={[0, 0.09, 0]} castShadow>
        <cylinderGeometry args={[0.055, 0.055, 0.14, 16]} />
        <meshStandardMaterial color="#222" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.09 + 0.55, 0]} castShadow scale={[1.5, 1, 0.3]}>
        <cylinderGeometry args={[0.03, 0.03, 1.0, 12]} />
        <meshStandardMaterial color="#334155" metalness={0.5} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.09 + 0.55 + 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.028, 0.028, 0.06, 12]} />
        <meshStandardMaterial color="#1e293b" metalness={0.5} roughness={0.5} />
      </mesh>
    </group>
  );
}

export default function RouterModel({ device, nodeId, exploded, selected, registerPort, onPortClick, devColor }) {
  const { w, h, d } = device.dims;
  const e = exploded;
  const body = devColor || "#2b3746";
  const antennaX = [-w * 0.3, -w * 0.1, w * 0.1, w * 0.3];

  return (
    <group>
      {/* Chassis: RoundedBox แทน BoxGeometry เหลี่ยมคม ให้สันขอบรับแสงสวยงาม */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <primitive object={new RoundedBoxGeometry(w, h, d, 0.06, 5)} />
        <meshStandardMaterial color={selected ? "#34506b" : body} metalness={0.55} roughness={0.45} />
      </mesh>

      {/* ฝาครอบด้านบน (รอยต่อฝา-ตัวเครื่อง) */}
      <mesh position={[0, h / 2 - 0.03 + e * 0.5, 0]} castShadow>
        <primitive object={new RoundedBoxGeometry(w * 0.96, 0.055, d * 0.94, 0.02, 4)} />
        <meshStandardMaterial color="#3a4656" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* ฐานรองยาง 4 มุมด้านใต้ */}
      <RouterFeet w={w} h={h} d={d} />

      {/* ===== ด้านหน้า (+Z) ===== */}
      <RouterLeds w={w} h={h} d={d} count={7} />
      <RouterLogo w={w} h={h} d={d} />
      <RouterFrontVent w={w} d={d} y={h / 2 - 0.07} count={5} />
      <RouterFrontVent w={w} d={d} y={-h / 2 + 0.07} count={5} />

      {/* ===== ด้านหลัง (-Z) ===== */}
      <group position={[0, 0, -d / 2]}>
        <DcJack x={-w * 0.38} y={h / 2 - 0.14} />
        <PowerButton x={-w * 0.13} y={h / 2 - 0.14} />
        <WpsButton x={w * 0.05} y={h / 2 - 0.14} />
        <ResetButton x={w * 0.3} y={h / 2 - 0.14} />
        <RearVents w={w} h={h} />
        <Rj45Port
          x={-w * 0.34}
          y={-h / 2 + 0.22}
          wan={true}
          nodeId={nodeId}
          portId="WAN"
          registerPort={registerPort}
        />
        {[0, 1, 2, 3].map((i) => (
          <Rj45Port
            key={i}
            x={-w * 0.12 + i * 0.26}
            y={-h / 2 + 0.22}
            nodeId={nodeId}
            portId={`LAN${i + 1}`}
            registerPort={registerPort}
          />
        ))}
        {antennaX.map((x, i) => (
          <RouterAntenna key={i} x={x} y={h / 2 - 0.05} />
        ))}
      </group>
    </group>
  );
}
