import type { FC } from "react";

export type DemoStep = { caption: string; announce?: string };

export type PatternDemoModule = {
  id: string;
  title: string;
  microExample: string;
  steps: DemoStep[];
  StepView: FC<{ step: number; accent: string }>;
  StaticFrame: FC<{ accent: string }>;
};

export type AnalogyDef = {
  title: string;
  caption: string;
};
