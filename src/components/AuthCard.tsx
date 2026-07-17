"use client";

import { useState, type FormEvent } from "react";
import { api } from "../api";
import type { PublicUser } from "../types";

export function AuthCard({ onAuthenticated }: { onAuthenticated: (user: PublicUser) => void }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const result = await api<{ user: PublicUser }>(`/auth/${mode}`, { method: "POST", body: JSON.stringify(form) });
      onAuthenticated(result.user);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to sign in.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className="panel auth-card">
      <div className="section-head"><div><p className="eyebrow">Private wellness journal</p><h3>{mode === "login" ? "Sign in to your dashboard" : "Create your VitaForge account"}</h3></div></div>
      <form className="form-panel" onSubmit={submit}>
        {mode === "register" && <label>Name<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} autoComplete="name" required /></label>}
        <label>Email<input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} autoComplete="email" required /></label>
        <label>Password<input type="password" minLength={8} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} autoComplete={mode === "login" ? "current-password" : "new-password"} required /></label>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="primary-button" disabled={busy} type="submit">{busy ? "Working..." : mode === "login" ? "Sign In" : "Create Account"}</button>
        <button className="text-button" type="button" onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}>{mode === "login" ? "New here? Create an account" : "Already registered? Sign in"}</button>
      </form>
    </article>
  );
}
