/**
 * jsdom ships no types and the repo has no @types/jsdom, so this declares only what
 * tests/lessonArtifacts.test.ts uses: running a page's scripts and collecting its errors.
 */
declare module "jsdom" {
  export class VirtualConsole {
    on(event: "jsdomError", listener: (error: { message: string; detail?: unknown }) => void): this;
    on(event: "error", listener: (...args: unknown[]) => void): this;
  }
  export class JSDOM {
    constructor(
      html: string,
      options?: {
        runScripts?: "dangerously" | "outside-only";
        pretendToBeVisual?: boolean;
        url?: string;
        virtualConsole?: VirtualConsole;
      },
    );
    readonly window: Window & typeof globalThis & { __setLessonLang?: (lang: "py" | "ts") => void };
  }
}
