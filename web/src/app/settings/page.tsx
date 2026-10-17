import type { Metadata } from "next";
import { SettingsClient } from "./SettingsClient";
import { canonicalFor } from "@/lib/seo/site";

export const metadata: Metadata = {
  title: "Settings & Preferences · leetExpert",
  description:
    "Manage learning preferences, default programming language, editor configuration, account sync status, and data export.",
  alternates: canonicalFor("/settings"),
};

export default function SettingsPage() {
  return <SettingsClient />;
}
