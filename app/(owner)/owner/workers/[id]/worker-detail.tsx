"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/database.types";
import { avatarUrl, listDocuments, openDocumentUrl, type WorkerDocument } from "@/lib/documents/queries";
import { fmtLongDate } from "@/lib/shifts/format";

type Profile = Pick<Database["public"]["Tables"]["profiles"]["Row"],
  "first_name" | "last_name" | "phone_number" | "account_status" | "employee_number" | "avatar_path"
>;

const card = "rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6";
const navy = "text-[hsl(var(--dark-blue))]";

export default function WorkerDetail({ workerId }: { workerId: string }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [documents, setDocuments] = useState<WorkerDocument[]>([]);
  const [photo, setPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const { data, error } = await createClient()
          .from("profiles")
          .select("first_name, last_name, phone_number, account_status, employee_number, avatar_path")
          .eq("id", workerId)
          .maybeSingle();
        if (!alive) return;
        if (error) throw error;
        if (!data) {
          setMessage("Worker not found.");
          return;
        }
        setProfile(data);
        const [docs, url] = await Promise.all([listDocuments(workerId), avatarUrl(data.avatar_path)]);
        if (alive) {
          setDocuments(docs);
          setPhoto(url);
        }
      } catch {
        if (alive) setMessage("Could not load worker details. Please refresh the page.");
      } finally {
        if (alive) setLoading(false);
      }
    }
    void load();
    return () => { alive = false; };
  }, [workerId]);

  async function openDocument(path: string) {
    const tab = window.open("about:blank", "_blank");
    if (!tab) {
      setMessage("Allow pop-ups to open this document.");
      return;
    }
    tab.opener = null;
    const url = await openDocumentUrl(path).catch(() => null);
    if (url) {
      setMessage("");
      tab.location.replace(url);
    } else {
      tab.close();
      setMessage("Could not open this document.");
    }
  }

  const name = profile && `${profile.first_name} ${profile.last_name}`.trim();
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <Link href="/owner/workers" className={`inline-flex items-center gap-1 text-sm font-semibold ${navy}`}>
        <ChevronLeft className="size-4" aria-hidden /> Back to Workers
      </Link>
      {loading && <p className="text-sm text-slate-500">Loading worker...</p>}
      {message && <p role="status" className="text-sm font-semibold text-red-600">{message}</p>}
      {profile && !loading && (
        <>
          <section className={`${card} flex items-center gap-4`}>
            {photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photo} alt="" className="size-20 rounded-full object-cover" />
            ) : (
              <span className="flex size-20 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <User className="size-8" aria-hidden />
              </span>
            )}
            <div>
              <h1 className={`text-2xl font-extrabold ${navy}`}>{name || "Unnamed Worker"}</h1>
              <p className="text-sm text-slate-500">Employee #{profile.employee_number}</p>
              <span className={`mt-2 inline-block rounded-lg px-2.5 py-1 text-xs font-bold ${profile.account_status === "active" ? "bg-[#E2F3E6] text-green-700" : "bg-slate-100 text-slate-500"}`}>
                {profile.account_status === "active" ? "Active" : "Inactive"}
              </span>
            </div>
          </section>
          <section className={card}>
            <h2 className={`text-lg font-bold uppercase ${navy}`}>Personal Information</h2>
            <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-bold uppercase text-slate-400">Full name</dt>
                <dd className="mt-1 text-sm font-semibold text-slate-800">{name || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase text-slate-400">Phone number</dt>
                <dd className="mt-1 text-sm font-semibold text-slate-800">{profile.phone_number || "—"}</dd>
              </div>
            </dl>
          </section>
          <section className={card}>
            <h2 className={`text-lg font-bold uppercase ${navy}`}>Documents</h2>
            {documents.length === 0 ? (
              !message && <p className="mt-4 text-sm text-slate-500">No documents uploaded yet.</p>
            ) : (
              <ul className="mt-4 divide-y divide-slate-200">
                {documents.map((doc) => (
                  <li key={doc.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className={`text-sm font-bold ${navy}`}>{doc.typeLabel}</p>
                      <p className="truncate text-xs text-slate-500">{doc.fileName} · {fmtLongDate(new Date(doc.uploadedAt))}</p>
                    </div>
                    <button type="button" onClick={() => openDocument(doc.path)}
                      className="shrink-0 rounded-full border border-blue-700 px-4 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-50">
                      OPEN
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}
