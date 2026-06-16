"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import type { Prospect, ProspectStatus } from "@/lib/prospects/types";

const STATUS_LABELS: Record<ProspectStatus, string> = {
  not_contacted: "Not contacted",
  contacted: "Contacted",
  replied: "Replied",
  demo_scheduled: "Demo scheduled",
  passed: "Passed",
};

function getSecret(): string {
  if (typeof window === "undefined") return "";
  return sessionStorage.getItem("clerkflow_internal_secret") ?? "";
}

function apiHeaders(): HeadersInit {
  const secret = getSecret();
  return secret ? { "x-internal-secret": secret, "Content-Type": "application/json" } : { "Content-Type": "application/json" };
}

export default function ProspectsPage() {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [secretInput, setSecretInput] = useState("");
  const [form, setForm] = useState({
    townName: "",
    state: "",
    population: "",
    clerkName: "",
    email: "",
    phone: "",
    notes: "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/prospects", { headers: apiHeaders() });
      if (!res.ok) throw new Error(await res.text());
      const data = (await res.json()) as { prospects: Prospect[] };
      setProspects(data.prospects);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to load prospects");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const saved = sessionStorage.getItem("clerkflow_internal_secret");
    if (saved) setSecretInput(saved);
    load();
  }, [load]);

  function saveSecret() {
    sessionStorage.setItem("clerkflow_internal_secret", secretInput.trim());
    setMessage("Secret saved for this browser session.");
    load();
  }

  async function onAddProspect(e: FormEvent) {
    e.preventDefault();
    setMessage("");
    const res = await fetch("/api/prospects", {
      method: "POST",
      headers: apiHeaders(),
      body: JSON.stringify({
        townName: form.townName,
        state: form.state,
        population: form.population ? Number(form.population) : null,
        clerkName: form.clerkName,
        email: form.email,
        phone: form.phone || null,
        notes: form.notes,
      }),
    });
    if (!res.ok) {
      setMessage(await res.text());
      return;
    }
    setForm({ townName: "", state: "", population: "", clerkName: "", email: "", phone: "", notes: "" });
    setMessage("Prospect added.");
    load();
  }

  async function sendOne(id: string) {
    setMessage("");
    const res = await fetch(`/api/prospects/${id}/send`, { method: "POST", headers: apiHeaders() });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error ?? "Send failed");
      return;
    }
    setMessage(`Email sent to ${data.prospect.email} (${data.send.mode}).`);
    load();
  }

  async function sendBatch() {
    if (!confirm("Send demo emails to all not-contacted prospects?")) return;
    setMessage("");
    const res = await fetch("/api/prospects/send-batch", { method: "POST", headers: apiHeaders() });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error ?? "Batch send failed");
      return;
    }
    setMessage(`Batch complete: ${data.sent}/${data.attempted} sent.`);
    load();
  }

  async function updateStatus(id: string, status: ProspectStatus) {
    const res = await fetch(`/api/prospects/${id}`, {
      method: "PATCH",
      headers: apiHeaders(),
      body: JSON.stringify({ status }),
    });
    if (res.ok) load();
  }

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem 1.5rem" }}>
      <p style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "#64748b" }}>Internal — founder only</p>
      <h1 style={{ marginTop: 0 }}>Clerk prospecting</h1>
      <p style={{ color: "#475569" }}>
        Track clerks to contact and send demo request emails. Without <code>RESEND_API_KEY</code>, sends run in dry-run mode (logged to server console).
      </p>

      <section style={{ background: "#f1f5f9", padding: "1rem", borderRadius: 8, marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1rem", marginTop: 0 }}>Access secret (optional)</h2>
        <p style={{ fontSize: "0.875rem", color: "#475569" }}>
          Set <code>INTERNAL_SECRET</code> in Vercel, then paste it here once per browser.
        </p>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <input
            type="password"
            value={secretInput}
            onChange={(e) => setSecretInput(e.target.value)}
            placeholder="INTERNAL_SECRET"
            style={{ flex: 1, minWidth: 200, padding: "0.5rem" }}
          />
          <button type="button" onClick={saveSecret} style={{ padding: "0.5rem 1rem" }}>
            Save
          </button>
        </div>
      </section>

      {message ? <p style={{ color: "#1e3a5f" }}>{message}</p> : null}

      <section style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
          <h2 style={{ margin: 0 }}>Prospects ({prospects.length})</h2>
          <button type="button" onClick={sendBatch} style={{ padding: "0.5rem 1rem", background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 6 }}>
            Send batch to not contacted
          </button>
        </div>

        {loading ? (
          <p>Loading…</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "1rem", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "2px solid #e2e8f0" }}>
                <th style={{ padding: "0.5rem" }}>Town</th>
                <th style={{ padding: "0.5rem" }}>Clerk</th>
                <th style={{ padding: "0.5rem" }}>Email</th>
                <th style={{ padding: "0.5rem" }}>Status</th>
                <th style={{ padding: "0.5rem" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {prospects.map((p) => (
                <tr key={p.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                  <td style={{ padding: "0.5rem" }}>
                    {p.townName}, {p.state}
                    {p.population ? <div style={{ color: "#64748b" }}>pop. {p.population.toLocaleString()}</div> : null}
                  </td>
                  <td style={{ padding: "0.5rem" }}>{p.clerkName}</td>
                  <td style={{ padding: "0.5rem" }}>{p.email}</td>
                  <td style={{ padding: "0.5rem" }}>
                    <select value={p.status} onChange={(e) => updateStatus(p.id, e.target.value as ProspectStatus)}>
                      {Object.entries(STATUS_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                    {p.lastContactedAt ? (
                      <div style={{ color: "#64748b", fontSize: "0.75rem" }}>Last: {new Date(p.lastContactedAt).toLocaleDateString()}</div>
                    ) : null}
                  </td>
                  <td style={{ padding: "0.5rem" }}>
                    <button type="button" onClick={() => sendOne(p.id)} style={{ padding: "0.35rem 0.75rem" }}>
                      Send demo email
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section>
        <h2>Add prospect</h2>
        <form onSubmit={onAddProspect} style={{ display: "grid", gap: "0.75rem", maxWidth: 520 }}>
          <input required placeholder="Town name" value={form.townName} onChange={(e) => setForm({ ...form, townName: e.target.value })} style={{ padding: "0.5rem" }} />
          <input required placeholder="State (e.g. OH)" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} style={{ padding: "0.5rem" }} />
          <input placeholder="Population" value={form.population} onChange={(e) => setForm({ ...form, population: e.target.value })} style={{ padding: "0.5rem" }} />
          <input required placeholder="Clerk name" value={form.clerkName} onChange={(e) => setForm({ ...form, clerkName: e.target.value })} style={{ padding: "0.5rem" }} />
          <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={{ padding: "0.5rem" }} />
          <input placeholder="Phone (optional)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} style={{ padding: "0.5rem" }} />
          <textarea placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} style={{ padding: "0.5rem", minHeight: 80 }} />
          <button type="submit" style={{ padding: "0.5rem 1rem", width: "fit-content" }}>
            Add prospect
          </button>
        </form>
      </section>
    </div>
  );
}
