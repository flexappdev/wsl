import { AboutStrip } from "./AboutStrip";

type Props = {
  crumb: string;
  title: string;
  sub: string;
};

export function StubPage({ crumb, title, sub }: Props) {
  return (
    <div>
      <div className="page-head">
        <div>
          <div className="crumb">{crumb}</div>
          <h1>{title}</h1>
          <div className="sub">{sub}</div>
        </div>
      </div>
      <div
        className="empty"
        style={{
          padding: "48px 24px",
          marginTop: 16,
        }}
      >
        <div className="empty-title">Coming soon</div>
        <div className="empty-body">
          This section is being ported from the v2 design. The Dashboard at <code>/</code> is fully wired; sub-pages are next.
        </div>
      </div>
      <AboutStrip />
    </div>
  );
}
