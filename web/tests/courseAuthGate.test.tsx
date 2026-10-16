// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { CourseAuthGate } from "@/components/auth/CourseAuthGate";
import { CourseAuthCheck } from "@/components/auth/CourseAuthCheck";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

type Session = { data: unknown; isPending: boolean };
let session: Session = { data: null, isPending: false };
let authEnabled = true;
let currentPathname = "/courses/dsa";
const replace = vi.fn();

vi.mock("@/lib/auth/client", () => ({
  authClient: { useSession: () => session },
}));

vi.mock("next/navigation", () => ({
  usePathname: () => currentPathname,
  useRouter: () => ({ replace }),
}));

vi.mock("@/components/providers/SyncBridge", () => ({
  useSyncBridge: () => ({ authEnabled }),
}));

let root: Root | null = null;
let host: HTMLElement;

beforeEach(() => {
  session = { data: null, isPending: false };
  authEnabled = true;
  currentPathname = "/courses/dsa";
  replace.mockClear();
  host = document.createElement("div");
  document.body.append(host);
});

afterEach(() => {
  act(() => root?.unmount());
  root = null;
  document.body.innerHTML = "";
});

function render(node: React.ReactNode) {
  root = createRoot(host);
  act(() => root!.render(node));
}

describe("CourseAuthGate", () => {
  it("renders children directly when auth is disabled", () => {
    authEnabled = false;
    render(<CourseAuthGate><div>Course Content</div></CourseAuthGate>);
    expect(host.textContent).toContain("Course Content");
  });

  it("renders children directly on non-course routes", () => {
    authEnabled = true;
    currentPathname = "/";
    render(<CourseAuthGate><div>Landing Content</div></CourseAuthGate>);
    expect(host.textContent).toContain("Landing Content");
  });
});

describe("CourseAuthCheck", () => {
  it("shows loading and redirects to /sign-in when unauthenticated", () => {
    session = { data: null, isPending: false };
    currentPathname = "/courses/dsa/arrays";
    render(<CourseAuthCheck><div>Protected Lesson</div></CourseAuthCheck>);

    expect(host.textContent).not.toContain("Protected Lesson");
    expect(host.textContent).toContain("Verifying course access");
    expect(replace).toHaveBeenCalledWith("/sign-in?next=%2Fcourses%2Fdsa%2Farrays");
  });

  it("shows loading while session is pending", () => {
    session = { data: null, isPending: true };
    currentPathname = "/courses/dsa/arrays";
    render(<CourseAuthCheck><div>Protected Lesson</div></CourseAuthCheck>);

    expect(host.textContent).not.toContain("Protected Lesson");
    expect(host.textContent).toContain("Verifying course access");
    expect(replace).not.toHaveBeenCalled();
  });

  it("renders protected content when user is signed in", () => {
    session = { data: { user: { id: "learner-1" } }, isPending: false };
    currentPathname = "/courses/dsa/arrays";
    render(<CourseAuthCheck><div>Protected Lesson</div></CourseAuthCheck>);

    expect(host.textContent).toContain("Protected Lesson");
    expect(replace).not.toHaveBeenCalled();
  });
});
