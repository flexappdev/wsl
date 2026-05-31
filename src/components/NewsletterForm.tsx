"use client";

import { useState } from "react";

type Status = "idle" | "loading" | "ok" | "error";

interface Props {
  source?: string;
  cta?: string;
  placeholder?: string;
}

export default function NewsletterForm({
  source = "fleet",
  cta = "Subscribe",
  placeholder = "you@example.com",
}: Props) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string>("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, source }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus("error");
        setMessage(json?.error || "Subscribe failed");
        return;
      }
      setStatus("ok");
      setMessage("Subscribed — check your inbox.");
      setEmail("");
      try {
        window.dispatchEvent(new CustomEvent("newsletter:subscribed", { detail: { source } }));
      } catch {}
    } catch (err) {
      setStatus("error");
      setMessage((err as Error).message || "Network error");
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-2 w-full max-w-md">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={placeholder}
        className="flex-1 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100"
        disabled={status === "loading"}
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="rounded bg-zinc-900 dark:bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-100 dark:text-zinc-900 disabled:opacity-50"
      >
        {status === "loading" ? "…" : cta}
      </button>
      {message && (
        <span
          role="status"
          className={`text-xs self-center ${status === "ok" ? "text-emerald-600" : "text-red-600"}`}
        >
          {message}
        </span>
      )}
    </form>
  );
}
