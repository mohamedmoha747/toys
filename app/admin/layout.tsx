import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "Limee enterprise" },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
