"use client";
import React, { useEffect, useState } from "react";
import TopNav from "@/app/components/TopNav";
import { SkeletonRows } from "@/app/components/Skeleton";
import { useSession } from "@/app/components/auth/SessionProvider";
import { apiFetch } from "@/app/data/api";

interface PublicUser {
  id: string;
  email: string;
  isAdmin: boolean;
  createdAt: string;
  deletedAt?: string | null;
}

// Matches PURGE_AFTER_DAYS in the API's cron.service. Display only -- the API's
// copy is what actually decides when an account dies -- so drift misleads the
// countdown but breaks nothing. Same arrangement as RosterList.
const PURGE_AFTER_DAYS = 30;

// Same rounding as RosterList.daysLeft. The two countdowns describe the same
// 30-day window run by the same cron, so a user and their armies must not
// report different numbers of days left.
const daysLeft = (deletedAt: string): number => {
  const elapsed = (Date.now() - new Date(deletedAt).getTime()) / 86400000;
  return Math.max(0, Math.ceil(PURGE_AFTER_DAYS - elapsed));
};

const field =
  "mt-1.5 w-full border border-white/15 bg-black/40 px-3 py-2 font-sans text-sm text-white outline-none focus:border-fuchsia-400";
const label = "font-mono text-[11px] tracking-[0.1em] text-white/45";

const UserAdmin: React.FC = () => {
  const { user: me } = useSession();

  const [users, setUsers] = useState<PublicUser[] | null>(null);
  const [binned, setBinned] = useState<PublicUser[]>([]);
  const [denied, setDenied] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  // The row being edited, held as a draft so a half-typed change is not written
  // to the list until it is saved.
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState({
    email: "",
    password: "",
    isAdmin: false,
  });

  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  // Two-click confirm before a delete, matching the roster PURGE→CONFIRM? flow.
  const [confirming, setConfirming] = useState<string | null>(null);

  const load = async () => {
    const [active, deleted] = await Promise.all([
      apiFetch("/users"),
      apiFetch("/users/deleted"),
    ]);

    if (active.status === 403) {
      setDenied(true);
      setUsers([]);
      return;
    }

    setUsers(active.ok ? await active.json() : []);
    setBinned(deleted.ok ? await deleted.json() : []);
  };

  useEffect(() => {
    void load();
  }, []);

  // Every mutation reports the API's own message rather than inventing one: the
  // guards ("cannot demote the last administrator") are the useful text.
  const run = async (
    fn: () => Promise<Response>,
    success: string,
  ): Promise<boolean> => {
    setBusy(true);
    setError(null);
    setDone(null);

    try {
      const res = await fn();

      if (!res.ok && res.status !== 204) {
        const body = (await res.json().catch(() => null)) as {
          message?: string;
        } | null;
        setError(body?.message ?? `Failed (${res.status}).`);
        return false;
      }

      setDone(success);
      await load();
      return true;
    } finally {
      setBusy(false);
    }
  };

  const create = async (e: React.FormEvent) => {
    e.preventDefault();

    const ok = await run(
      () =>
        apiFetch("/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, isAdmin }),
        }),
      `Created ${email}.`,
    );

    if (ok) {
      setEmail("");
      setPassword("");
      setIsAdmin(false);
    }
  };

  const startEdit = (u: PublicUser) => {
    setEditing(u.id);
    setDraft({ email: u.email, password: "", isAdmin: u.isAdmin });
    setError(null);
    setDone(null);
  };

  const saveEdit = async (id: string) => {
    // An omitted password means "leave it alone"; sending "" would be rejected
    // by the API as too short, which is not what a blank field means here.
    const body: Record<string, unknown> = {
      email: draft.email,
      isAdmin: draft.isAdmin,
    };
    if (draft.password) body.password = draft.password;

    const ok = await run(
      () =>
        apiFetch(`/users/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }),
      "Saved.",
    );

    if (ok) setEditing(null);
  };

  if (denied) {
    return (
      <div className="min-h-screen bg-[#08080a] text-white/90">
        <TopNav />
        <main className="px-10 py-16 text-center font-mono text-[11px] tracking-[0.1em] text-white/40">
          ADMINS ONLY
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#08080a] text-white/90">
      <TopNav />

      <main className="mx-auto max-w-3xl px-10 py-10">
        <h1 className="font-amsterdam text-4xl font-bold text-white">Users</h1>
        <p className="mt-1 font-mono text-[11px] tracking-[0.1em] text-white/40">
          ACCOUNTS ARE CREATED HERE — THERE IS NO PUBLIC SIGN-UP
        </p>

        <form
          onSubmit={create}
          className="mt-8 border border-white/10 bg-white/[0.02] p-6"
        >
          <div className="flex flex-wrap gap-4">
            <label className={`min-w-[220px] flex-1 ${label}`}>
              EMAIL
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={field}
              />
            </label>

            <label className={`min-w-[220px] flex-1 ${label}`}>
              PASSWORD
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={field}
              />
            </label>
          </div>

          <label className={`mt-4 flex items-center gap-2 ${label}`}>
            <input
              type="checkbox"
              checked={isAdmin}
              onChange={(e) => setIsAdmin(e.target.checked)}
            />
            ADMINISTRATOR
          </label>

          <button
            type="submit"
            disabled={busy}
            className="mt-5 bg-fuchsia-500 px-5 py-2.5 font-amsterdam text-sm font-bold uppercase tracking-[0.1em] text-black transition-[filter] hover:brightness-110 disabled:opacity-50"
          >
            {busy ? "Working…" : "Add User"}
          </button>
        </form>

        {error && (
          <p role="alert" className="mt-4 font-mono text-[11px] text-red-400">
            {error}
          </p>
        )}
        {done && (
          <p className="mt-4 font-mono text-[11px] text-emerald-400">{done}</p>
        )}

        <div className="mt-10">
          <div className="font-mono text-hud text-white/40">
            EXISTING ACCOUNTS
          </div>

          {users === null ? (
            <SkeletonRows rows={4} className="mt-3" />
          ) : (
            <div className="mt-3">
              {users.map((u) =>
                editing === u.id ? (
                  <div
                    key={u.id}
                    className="border-b border-white/[0.05] bg-white/[0.02] px-3 py-4"
                  >
                    <div className="flex flex-wrap gap-4">
                      <label className={`min-w-[200px] flex-1 ${label}`}>
                        EMAIL
                        <input
                          type="email"
                          value={draft.email}
                          onChange={(e) =>
                            setDraft({ ...draft, email: e.target.value })
                          }
                          className={field}
                        />
                      </label>
                      <label className={`min-w-[200px] flex-1 ${label}`}>
                        NEW PASSWORD (BLANK = UNCHANGED)
                        <input
                          type="password"
                          value={draft.password}
                          onChange={(e) =>
                            setDraft({ ...draft, password: e.target.value })
                          }
                          className={field}
                        />
                      </label>
                    </div>

                    <label className={`mt-3 flex items-center gap-2 ${label}`}>
                      <input
                        type="checkbox"
                        checked={draft.isAdmin}
                        onChange={(e) =>
                          setDraft({ ...draft, isAdmin: e.target.checked })
                        }
                      />
                      ADMINISTRATOR
                    </label>

                    <div className="mt-4 flex gap-2">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void saveEdit(u.id)}
                        className="bg-fuchsia-500 px-4 py-2 font-amsterdam text-xs font-bold uppercase tracking-[0.1em] text-black disabled:opacity-50"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditing(null)}
                        className="border border-white/20 px-4 py-2 font-amsterdam text-xs font-bold uppercase tracking-[0.1em] text-white/70"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    key={u.id}
                    className="flex items-center gap-3 border-b border-white/[0.05] px-1 py-2.5"
                  >
                    <span className="min-w-0 flex-1 truncate text-sm text-white/90">
                      {u.email}
                      {u.id === me?.id && (
                        <span className="ml-2 font-mono text-[10px] text-white/35">
                          (YOU)
                        </span>
                      )}
                    </span>

                    {u.isAdmin && (
                      <span className="font-mono text-[10px] tracking-[0.1em] text-fuchsia-400">
                        ADMIN
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => startEdit(u)}
                      className="font-mono text-[10px] tracking-[0.1em] text-white/45 hover:text-white"
                    >
                      EDIT
                    </button>

                    {/* Hidden for your own row: the API refuses it anyway, and
                        offering a button that always errors is a worse answer
                        than not offering it. */}
                    {u.id !== me?.id && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => {
                          if (confirming === u.id) {
                            setConfirming(null);
                            void run(
                              () =>
                                apiFetch(`/users/${u.id}`, {
                                  method: "DELETE",
                                }),
                              `Deleted ${u.email}.`,
                            );
                          } else {
                            setConfirming(u.id);
                          }
                        }}
                        className={`font-mono text-[10px] tracking-[0.1em] ${
                          confirming === u.id
                            ? "text-red-400"
                            : "text-white/45 hover:text-red-400"
                        }`}
                      >
                        {confirming === u.id ? "CONFIRM?" : "DELETE"}
                      </button>
                    )}
                  </div>
                ),
              )}
            </div>
          )}
        </div>

        {binned.length > 0 && (
          <div className="mt-10">
            <div className="font-mono text-hud text-white/40">
              RECENTLY DELETED
            </div>
            <p className="mt-1 font-mono text-[10px] text-white/30">
              Purged automatically after {PURGE_AFTER_DAYS} days, along with
              every army they own.
            </p>

            <div className="mt-3">
              {binned.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center gap-3 border-b border-white/[0.05] px-1 py-2.5"
                >
                  <span className="min-w-0 flex-1 truncate text-sm text-white/45 line-through">
                    {u.email}
                  </span>
                  {u.deletedAt &&
                    (() => {
                      const left = daysLeft(u.deletedAt);
                      return (
                        <span
                          className={`font-mono text-[10px] tracking-[0.1em] ${
                            left <= 3 ? "text-red-400/70" : "text-white/30"
                          }`}
                        >
                          {left === 0
                            ? "PURGES TONIGHT"
                            : `${left} ${left === 1 ? "DAY" : "DAYS"} LEFT`}
                        </span>
                      );
                    })()}
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() =>
                      void run(
                        () =>
                          apiFetch(`/users/${u.id}/restore`, {
                            method: "POST",
                          }),
                        `Restored ${u.email}.`,
                      )
                    }
                    className="font-mono text-[10px] tracking-[0.1em] text-white/45 hover:text-emerald-400"
                  >
                    RESTORE
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default UserAdmin;
