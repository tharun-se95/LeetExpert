import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { PerspectiveCamera, RoundedBox } from "@react-three/drei";
import { BoxGeometry } from "three";

const PURPLE = "#7c4dff";
const CYAN = "#00e6ff";
const CUBE_SIZE = 1.5;
const GAP = 0.14;
const N = 4;
const STACK_HEIGHT = N * (CUBE_SIZE + GAP) - GAP;

const cubeEdges = new BoxGeometry(CUBE_SIZE, CUBE_SIZE, CUBE_SIZE);
const LABELS = ["10", "20", "30", "40"];

const Cube: React.FC<{ index: number; active?: boolean; delay: number }> = ({
  index,
  active,
  delay,
}) => {
  const frame = useCurrentFrame();
  const local = frame - delay;
  const drop = interpolate(local, [0, 20], [5, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const y = index * (CUBE_SIZE + GAP) + Math.max(0, drop) - STACK_HEIGHT / 2 + CUBE_SIZE / 2;

  return (
    <group position={[0, y, 0]}>
      <RoundedBox args={[CUBE_SIZE, CUBE_SIZE, CUBE_SIZE]} radius={0.18} smoothness={4}>
        <meshPhysicalMaterial
          color={active ? "#4a35a0" : "#2c3c56"}
          roughness={active ? 0.22 : 0.35}
          metalness={0.08}
          clearcoat={0.7}
          clearcoatRoughness={0.15}
          emissive={active ? PURPLE : "#26344e"}
          emissiveIntensity={active ? 1.1 : 0.7}
        />
      </RoundedBox>
      <lineSegments>
        <edgesGeometry args={[cubeEdges]} />
        <lineBasicMaterial color={active ? "#c9b6ff" : "#5b7396"} />
      </lineSegments>
    </group>
  );
};

// 2D HTML labels overlaid on top of the WebGL canvas — far more reliable
// than 3D text (no font-loading risk in headless render) and easier to
// keep crisp/legible.
const LABEL_TOP_PCT = [74, 57, 43, 27];

export const StyleTestThree: React.FC = () => {
  const { width, height } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: "#070a10" }}>
      <ThreeCanvas width={width} height={height} linear>
        <color attach="background" args={["#070a10"]} />
        <fog attach="fog" args={["#070a10", 12, 28]} />
        <PerspectiveCamera
          makeDefault
          position={[4.5, 0.8, 15]}
          fov={40}
          onUpdate={(cam) => cam.lookAt(0, 0, 0)}
        />

        <hemisphereLight args={["#4a5c7e", "#05070c", 1.8]} />
        <ambientLight intensity={1.6} />
        <directionalLight position={[3, 6, 5]} intensity={2.4} color="#ffffff" />
        <directionalLight position={[-2, -1, 8]} intensity={1.4} color="#c9d6ff" />
        <pointLight position={[4.5, 0.8, 15]} intensity={90} color="#ffffff" distance={26} />
        <pointLight position={[-3, 1.5, 3]} intensity={30} color={PURPLE} distance={12} />
        <pointLight position={[2, -1, 4]} intensity={16} color={CYAN} distance={10} />

        <group rotation={[0.05, 0.5, 0]}>
          <Cube index={0} delay={0} />
          <Cube index={1} delay={6} />
          <Cube index={2} delay={12} />
          <Cube index={3} active delay={18} />
        </group>

        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -STACK_HEIGHT / 2 - 0.6, 0]}>
          <planeGeometry args={[24, 24]} />
          <meshStandardMaterial color="#0c1220" roughness={0.25} metalness={0.6} />
        </mesh>
      </ThreeCanvas>

      {LABELS.map((label, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: "50%",
            top: `${LABEL_TOP_PCT[i]}%`,
            translate: "-50% -50%",
            fontFamily: "'Space Grotesk', -apple-system, sans-serif",
            fontWeight: 700,
            fontSize: 40,
            color: i === 3 ? "#ffffff" : "#c7d2e0",
            textShadow: i === 3 ? "0 0 18px #7c4dffcc" : "0 2px 6px #000a",
          }}
        >
          {label}
        </div>
      ))}
    </AbsoluteFill>
  );
};
