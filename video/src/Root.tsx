import "./index.css";
import { Composition } from "remotion";
import {
  Ch01SolvingProblems,
  ch01CalculateMetadata,
} from "./compositions/ch01";
import {
  Family7PriorityStructures,
  family7CalculateMetadata,
} from "./compositions/family7";
import {
  Family3Sorting,
  family3SortingCalculateMetadata,
} from "./compositions/family3-sorting";
import { StyleTestThree } from "./compositions/style-test-three";
import { StyleTestTree } from "./compositions/style-test-tree";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="ch01-solving-problems"
        component={Ch01SolvingProblems}
        fps={30}
        width={1920}
        height={1080}
        durationInFrames={300}
        calculateMetadata={ch01CalculateMetadata}
      />
      <Composition
        id="family7-priority-structures"
        component={Family7PriorityStructures}
        fps={30}
        width={1920}
        height={1080}
        durationInFrames={300}
        calculateMetadata={family7CalculateMetadata}
      />
      <Composition
        id="family3-sorting"
        component={Family3Sorting}
        fps={30}
        width={1920}
        height={1080}
        durationInFrames={300}
        calculateMetadata={family3SortingCalculateMetadata}
      />
      <Composition
        id="style-test-three"
        component={StyleTestThree}
        fps={30}
        width={1920}
        height={1080}
        durationInFrames={60}
      />
      <Composition
        id="style-test-tree"
        component={StyleTestTree}
        fps={30}
        width={1920}
        height={1080}
        durationInFrames={60}
      />
    </>
  );
};
