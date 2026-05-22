import Link from "next/link";

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--background)" }}>
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold mb-2" style={{ color: "var(--foreground)" }}>Authentication error</h1>
        <p className="text-sm mb-4" style={{ color: "var(--foreground-muted)" }}>
          WSL backoffice is restricted to <code>mat@matsiems.com</code>. If you believe this is wrong, double-check the email you
          signed in with.
        </p>
        <Link href="/login" className="btn btn-primary btn-sm">Back to sign in</Link>
      </div>
    </div>
  );
}
