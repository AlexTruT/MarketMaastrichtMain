/**
 * Remounts on every client navigation so the enter animation re-runs.
 * Header / footer / CartBar live in layout and stay put.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
