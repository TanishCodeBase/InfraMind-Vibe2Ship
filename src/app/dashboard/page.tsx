import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your personal dashboard for tracking reports and progress.",
};

export default function DashboardPage(): JSX.Element {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background">
      <p className="text-muted-foreground text-sm">
        Dashboard — Day 3 implementation.
      </p>
    </main>
  );
}
