import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { PerspectiveCamera, Line } from "@react-three/drei";

const CYAN = "#00e6ff";

type Vec3 = [number, number, number];

type NodeDef = {
  id: string;
  pos: Vec3;
  label: string;
  active?: boolean;
  delay: number;
};

const NODES: NodeDef[] = [
  { id: "f4", pos: [0, 2.6, 0], label: "f(4)", delay: 0 },
  { id: "f3", pos: [-2.0, 0.7, -2.6], label: "f(3)", delay: 6 },
  { id: "f2", pos: [2.0, 0.7, -2.6], label: "f(2)", delay: 6 },
  { id: "f1a", pos: [-3.0, -1.3, -5.2], label: "f(1)", active: true, delay: 12 },
  { id: "f1b", pos: [-0.9, -1.3, -5.2], label: "f(1)", active: true, delay: 12 },
];

const EDGES: [string, string][] = [
  ["f4", "f3"],
  ["f4", "f2"],
  ["f3", "f1a"],
  ["f3", "f1b"],
];

const byId = Object.fromEntries(NODES.map((n) => [n.id, n]));

const Node: React.FC<NodeDef> = ({ pos, active, delay }) => {
  const frame = useCurrentFrame();
  const local = frame - delay;
  const pop = interpolate(local, [0, 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scale = interpolate(pop, [0, 1], [0.3, 1]);

  return (
    <mesh position={pos} scale={scale}>
      <sphereGeometry args={[0.62, 32, 32]} />
      <meshPhysicalMaterial
        color={active ? "#1a5a66" : "#22304a"}
        roughness={0.42}
        metalness={0.08}
        clearcoat={0.5}
        clearcoatRoughness={0.35}
        emissive={active ? CYAN : "#26344e"}
        emissiveIntensity={active ? 1.3 : 0.7}
      />
    </mesh>
  );
};

const Edge: React.FC<{ from: Vec3; to: Vec3; delay: number }> = ({ from, to, delay }) => {
  const frame = useCurrentFrame();
  const local = frame - delay;
  const draw = interpolate(local, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const mid: Vec3 = [
    from[0] + (to[0] - from[0]) * draw,
    from[1] + (to[1] - from[1]) * draw,
    from[2] + (to[2] - from[2]) * draw,
  ];
  return (
    <Line
      points={[from, mid]}
      color={CYAN}
      lineWidth={2.4}
      transparent
      opacity={0.75}
    />
  );
};

const LABEL_POS: Record<string, { top: string; left: string }> = {
  f4: { top: "33%", left: "44.7%" },
  f3: { top: "52%", left: "39.6%" },
  f2: { top: "54%", left: "61.6%" },
  f1a: { top: "65%", left: "40.6%" },
  f1b: { top: "66%", left: "49.3%" },
};

export const StyleTestTree: React.FC = () => {
  const { width, height } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: "#070a10" }}>
      <ThreeCanvas width={width} height={height} linear>
        <color attach="background" args={["#070a10"]} />
        <fog attach="fog" args={["#070a10", 8, 22]} />
        <PerspectiveCamera
          makeDefault
          position={[3.2, 2.4, 8.5]}
          fov={46}
          onUpdate={(cam) => cam.lookAt(0, 0.4, -2.6)}
        />

        <hemisphereLight args={["#4a5c7e", "#05070c", 1.8]} />
        <ambientLight intensity={1.6} />
        <directionalLight position={[3, 6, 5]} intensity={2} color="#ffffff" />
        <pointLight position={[3.2, 2.4, 8.5]} intensity={55} color="#ffffff" distance={20} />
        <pointLight position={[-2, -1, -5]} intensity={22} color={CYAN} distance={12} />

        {EDGES.map(([a, b]) => (
          <Edge key={`${a}-${b}`} from={byId[a].pos} to={byId[b].pos} delay={byId[b].delay - 4} />
        ))}
        {NODES.map((n) => (
          <Node key={n.id} {...n} />
        ))}
      </ThreeCanvas>

      {NODES.map((n) => (
        <div
          key={n.id}
          style={{
            position: "absolute",
            top: LABEL_POS[n.id].top,
            left: LABEL_POS[n.id].left,
            translate: "-50% -50%",
            fontFamily: "'Space Grotesk', -apple-system, sans-serif",
            fontWeight: 700,
            fontSize: n.active ? 26 : 24,
            color: n.active ? "#eafcff" : "#c7d2e0",
            textShadow: n.active ? "0 0 16px #00e6ffcc" : "0 2px 6px #000a",
            pointerEvents: "none",
          }}
        >
          {n.label}
        </div>
      ))}

      <div
        style={{
          position: "absolute",
          left: 16,
          bottom: 16,
          fontFamily: "'Fira Code', monospace",
          fontSize: 12,
          letterSpacing: 1,
          color: CYAN,
          background: "#00e6ff1a",
          border: "1px solid #00e6ff44",
          borderRadius: 6,
          padding: "4px 10px",
        }}
      >
        CALL DEPTH · Z-AXIS = RECURSION DEPTH
      </div>
    </AbsoluteFill>
  );
};
