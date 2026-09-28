import type { ReactNode } from "react";

type PanelShellProps = {
  children: ReactNode;
};

export function PanelShell({
  children,
}: PanelShellProps) {
  return (
    <div className="app-background min-h-screen text-slate-900">
      <div className="relative min-h-screen">
        <div
          aria-hidden="true"
          className="pointer-events-none fixed right-[7%] top-20 z-0 h-56 w-56 rounded-full bg-sky-300/15 blur-3xl"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none fixed left-[6%] top-[32%] z-0 h-72 w-72 rounded-full bg-violet-300/12 blur-3xl"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none fixed bottom-[4%] right-[34%] z-0 h-64 w-64 rounded-full bg-emerald-300/10 blur-3xl"
        />

        <div className="relative z-10 min-h-screen">
          {children}
        </div>
      </div>
    </div>
  );
}