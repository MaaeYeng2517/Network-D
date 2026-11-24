"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import DeviceModel from "@/components/three/DeviceModel";
import { DEVICE3D_MAP } from "@/lib/devices3d";

const BOUNDS = { x: 17, z: 13 };
const SEGMENTS = 22;

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

// derive floor / grid colors from the background color
function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  r = Math.round(r + (amt > 0 ? (255 - r) * amt : r * amt));
  g = Math.round(g + (amt > 0 ? (255 - g) * amt : g * amt));
  b = Math.round(b + (amt > 0 ? (255 - b) * amt : b * amt));
  return `#${[r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}

export default function DeviceScene({
  nodes,
  links,
  exploded,
  connectMode,
  pendingKey,
  selectedId,
  onMove,
  onSelect,
  onPortClick,
  onCanvasTap,
  onDropDevice,
  brightness = 1,
  env = 1,
  fog = 30,
  bg = "#0b0f14",
  devColor = "#2b3746",
  devScale = 1,
  toneMapping = "AgX", // AgX | Neutral | ACESFilmic | Linear
  exposure = 1.0,
}) {
  const apiRef = useRef({});
  const portRefs = useRef(new Map());
  const [dragging, setDragging] = useState(null);

  const floorColor = useMemo(() => shade(bg, 0.18), [bg]);
  const gridColor = useMemo(() => shade(bg, 0.35), [bg]);
  const gridColor2 = useMemo(() => shade(bg, 0.18), [bg]);

  const registerPort = useCallback((nodeId, portId, obj) => {
    const k = `${nodeId}:${portId}`;
    if (obj) portRefs.current.set(k, obj);
    else portRefs.current.delete(k);
  }, []);

  return (
    <div
      style={{ position: "absolute", inset: 0 }}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "copy";
      }}
      onDrop={(e) => {
        e.preventDefault();
        const type = e.dataTransfer.getData("text/plain");
        if (!type) return;
        const hit = apiRef.current.dropToGround?.(e.clientX, e.clientY);
        if (hit && onDropDevice) onDropDevice(type, hit.x, hit.z);
      }}
    >
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [12, 12, 16], fov: 45, near: 0.1, far: 200 }}
        onPointerMissed={() => onCanvasTap && onCanvasTap()}
        gl={{
          antialias: true,
          outputColorSpace: THREE.SRGBColorSpace,
          toneMapping: THREE[toneMapping === "ACESFilmic" ? "ACESFilmicToneMapping" : toneMapping === "Neutral" ? "NeutralToneMapping" : toneMapping === "Linear" ? "LinearToneMapping" : "AgXToneMapping"],
          toneMappingExposure: exposure,
        }}
        fallback={
          <div style={{ padding: 32, color: "var(--muted)", textAlign: "center" }}>
            เบราว์เซอร์นี้ไม่รองรับ WebGL — กรุณาเปิดด้วย Chrome / Edge / Firefox เวอร์ชันล่าสุด
          </div>
        }
      >
        <color attach="background" args={[bg]} />
        <fog attach="fog" args={[bg, fog, fog + 40]} />
        <ambientLight intensity={0.55 * env * brightness} />
        <directionalLight
          position={[10, 18, 8]}
          intensity={2.2 * env * brightness}
          castShadow
          shadow-mapSize-width={4096}
          shadow-mapSize-height={4096}
          shadow-camera-left={-30}
          shadow-camera-right={30}
          shadow-camera-top={30}
          shadow-camera-bottom={-30}
          shadow-camera-near={0.5}
          shadow-camera-far={120}
          shadow-bias={-0.0006}
          shadow-normalBias={0.02}
        />
        <directionalLight position={[-10, 8, -10]} intensity={0.8 * env * brightness} color="#3ea6ff" />
        <directionalLight position={[0, 14, -14]} intensity={0.5 * env * brightness} color="#5a7a99" />
        <directionalLight position={[0, 10, 14]} intensity={0.3 * env * brightness} color="#8aa0c0" />

        <gridHelper args={[40, 40, gridColor, gridColor2]} position={[0, 0.01, 0]} />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
          <planeGeometry args={[60, 60]} />
          <meshStandardMaterial color={floorColor} metalness={0.05} roughness={0.95} />
        </mesh>

        <ApiBridge apiRef={apiRef} />

        {nodes.map((n) => (
          <Draggable key={n.id} node={n} exploded={exploded} connectMode={connectMode}
            selectedId={selectedId}
            portRefs={portRefs} registerPort={registerPort} setDragging={setDragging}
            onMove={onMove} onSelect={onSelect} onPortClick={onPortClick} devScale={devScale} />
        ))}

        {links.map((l) => (
          <Cable key={l.id} aKey={`${l.a}:${l.ap}`} bKey={`${l.b}:${l.bp}`}
            color={l._color || "#3ea6ff"} dashed={l.cable === "console"}
            selected={selectedId === l.id} portRefs={portRefs} />
        ))}

        {connectMode && pendingKey && <PendingMarker portRefs={portRefs} pendingKey={pendingKey} />}

        <OrbitControls
          makeDefault
          enabled={!dragging}
          enableDamping
          dampingFactor={0.12}
          minDistance={6}
          maxDistance={60}
          maxPolarAngle={Math.PI / 2.05}
          target={[0, 0.5, 0]}
        />
      </Canvas>
    </div>
  );
}

// exposes drop-to-ground conversion to the HTML wrapper
function ApiBridge({ apiRef }) {
  const { camera, gl, raycaster } = useThree();
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), []);
  const ndc = useMemo(() => new THREE.Vector2(), []);
  const out = useMemo(() => new THREE.Vector3(), []);
  apiRef.current.dropToGround = (clientX, clientY) => {
    const r = gl.domElement.getBoundingClientRect();
    ndc.set(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1);
    raycaster.setFromCamera(ndc, camera);
    const p = raycaster.ray.intersectPlane(plane, out);
    if (!p) return null;
    return { x: clamp(p.x, -BOUNDS.x, BOUNDS.x), z: clamp(p.z, -BOUNDS.z, BOUNDS.z) };
  };
  return null;
}

function Draggable({ node, exploded, connectMode, selectedId, portRefs, registerPort, setDragging, onMove, onSelect, onPortClick, devScale }) {
  const groupRef = useRef(null);
  const { camera } = useThree();
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), []);
  const drag = useRef(null);

  // smoothly animate group.position toward node.{x,z}
  const target = useMemo(() => new THREE.Vector3(node.x, 0, node.z), [node.x, node.z]);
  useFrame((_, dt) => {
    const g = groupRef.current;
    if (!g) return;
    if (drag.current) return; // manual updates while dragging
    g.position.x += (target.x - g.position.x) * Math.min(1, dt * 12);
    g.position.z += (target.z - g.position.z) * Math.min(1, dt * 12);
  });

  const endDrag = () => {
    drag.current = null;
    setDragging(null);
  };

  const isSel = selectedId === node.id;

  return (
    <group
      ref={groupRef}
      position={[node.x, 0, node.z]}
      scale={devScale}
      onPointerDown={(e) => {
        if (connectMode) return; // ports handle connect
        e.stopPropagation();
        onSelect(node.id);
        const gp = new THREE.Vector3();
        if (e.ray.intersectPlane(plane, gp)) {
          drag.current = { ox: node.x - gp.x, oz: node.z - gp.z };
          setDragging(node.id);
          e.target.setPointerCapture?.(e.pointerId);
        }
      }}
      onPointerMove={(e) => {
        if (!drag.current) return;
        e.stopPropagation();
        const gp = new THREE.Vector3();
        if (e.ray.intersectPlane(plane, gp)) {
          const nx = clamp(gp.x + drag.current.ox, -BOUNDS.x, BOUNDS.x);
          const nz = clamp(gp.z + drag.current.oz, -BOUNDS.z, BOUNDS.z);
          if (groupRef.current) {
            groupRef.current.position.x = nx;
            groupRef.current.position.z = nz;
          }
          onMove(node.id, nx, nz);
        }
      }}
      onPointerUp={(e) => {
        if (drag.current) {
          e.stopPropagation();
          e.target.releasePointerCapture?.(e.pointerId);
          endDrag();
        }
      }}
      onPointerOver={(e) => {
        if (connectMode) return;
        document.body.style.cursor = "grab";
      }}
      onPointerOut={() => {
        if (!drag.current) document.body.style.cursor = "auto";
      }}
    >
      <DeviceModel
        device={DEVICE3D_MAP[node.type]}
        nodeId={node.id}
        exploded={exploded}
        selected={isSel}
        registerPort={registerPort}
        onPortClick={onPortClick}
      />
      {isSel && <SelectionRing />}
    </group>
  );
}

function SelectionRing() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
      <ringGeometry args={[1.4, 1.55, 48]} />
      <meshBasicMaterial color="#3ea6ff" transparent opacity={0.8} />
    </mesh>
  );
}

// glowing sphere drawn at the first pending port so the user sees the start point
function PendingMarker({ portRefs, pendingKey }) {
  const ref = useRef(null);
  const v = useMemo(() => new THREE.Vector3(), []);
  useFrame(() => {
    const m = ref.current;
    if (!m) return;
    const obj = pendingKey ? portRefs.current.get(pendingKey) : null;
    if (!obj) {
      m.visible = false;
      return;
    }
    m.visible = true;
    obj.getWorldPosition(v);
    m.position.copy(v);
  });
  return (
    <mesh ref={ref} visible={false}>
      <sphereGeometry args={[0.09, 12, 12]} />
      <meshBasicMaterial color="#d29922" />
    </mesh>
  );
}

function Cable({ aKey, bKey, color, dashed, selected, portRefs }) {
  const line = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(SEGMENTS * 3), 3));
    const m = dashed
      ? new THREE.LineDashedMaterial({ color, dashSize: 0.3, gapSize: 0.18, transparent: true, opacity: 0.95 })
      : new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.95 });
    const l = new THREE.Line(g, m);
    l.frustumCulled = false;
    return l;
  }, [color, dashed]);

  // recolor when selection changes
  const matColor = selected ? "#ffffff" : color;
  useFrame(() => {
    const A = portRefs.current.get(aKey);
    const B = portRefs.current.get(bKey);
    if (!A || !B) {
      line.visible = false;
      return;
    }
    line.visible = true;
    const a = A.getWorldPosition(new THREE.Vector3());
    const b = B.getWorldPosition(new THREE.Vector3());
    if (!Number.isFinite(a.x) || !Number.isFinite(a.y) || !Number.isFinite(a.z) ||
        !Number.isFinite(b.x) || !Number.isFinite(b.y) || !Number.isFinite(b.z)) {
      line.visible = false;
      return;
    }
    const arr = line.geometry.attributes.position.array;
    const lift = a.distanceTo(b) * 0.28 + 0.4;
    const cx = (a.x + b.x) / 2;
    const cy = (a.y + b.y) / 2 + lift;
    const cz = (a.z + b.z) / 2;
    for (let i = 0; i < SEGMENTS; i++) {
      const t = i / (SEGMENTS - 1);
      const it = 1 - t;
      arr[i * 3] = it * it * a.x + 2 * it * t * cx + t * t * b.x;
      arr[i * 3 + 1] = it * it * a.y + 2 * it * t * cy + t * t * b.y;
      arr[i * 3 + 2] = it * it * a.z + 2 * it * t * cz + t * t * b.z;
    }
    line.geometry.attributes.position.needsUpdate = true;
    line.geometry.computeBoundingSphere();
    if (dashed) line.computeLineDistances();
  });

  // update material color reactively
  const matRef = useRef(null);
  if (line.material && !matRef.current) matRef.current = line.material;
  if (matRef.current) matRef.current.color.set(matColor);

  return <primitive object={line} />;
}