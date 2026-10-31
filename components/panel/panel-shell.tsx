import type { ReactNode } from "react";

type PanelShellProps = {
  children: ReactNode;
};

export function PanelShell({
  children,
}: PanelShellProps) {
  return (
    <div className="app-background min-h-screen text-foreground">
      {children}
    </div>
  );
}
