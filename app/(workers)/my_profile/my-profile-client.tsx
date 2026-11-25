"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  avatarUrl, deleteDocument, DOCUMENT_TYPES, listDocuments, openDocumentUrl,
  uploadAvatar, uploadDocument, type DocumentType, type WorkerDocument,
} from "@/lib/documents/queries";
import { fmtLongDate } from "@/lib/shifts/format";

const card = "rounded-2xl border border-[#D9D9D9] bg-white p-6";
const navy = "text-[hsl(var(--dark-blue))]";
const label = "mb-2 block text-xs font-bold uppercase";
const input = "w-full rounded-lg bg-blue-50 px-4 py-3 text-sm text-gray-700";
const button = "rounded-lg bg-blue-700 px-5 py-2 text-sm font-bold uppercase text-white disabled:opacity-50";

export default function MyProfileClient() {
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [employeeNumber, setEmployeeNumber] = useState<number | null>(null);
  const [form, setForm] = useState({ firstName: "", lastName: "", phone: "" });
  const [photo, setPhoto] = useState<string | null>(null);
  const [documents, setDocuments] = useState<WorkerDocument[] | null>(null);
  const [documentType, setDocumentType] = useState<DocumentType>("nbi_clearance");
  const fileInput = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!active) return;
      if (!user) {
        setMessage("Please sign in again.");
        return;
      }
      const { data, error } = await supabase.from("profiles")
        .select("first_name, last_name, phone_number, employee_number, avatar_path")
        .eq("id", user.id).single();
      if (error) throw error;
      if (!active) return;
      setUserId(user.id);
      setEmail(user.email ?? "");
      setEmployeeNumber(data.employee_number);
      setForm({ firstName: data.first_name, lastName: data.last_name, phone: data.phone_number ?? "" });
      const [url, docs] = await Promise.all([
        avatarUrl(data.avatar_path).catch(() => null),
        listDocuments(user.id).catch(() => null),
      ]);
      if (active) {
        setPhoto(url);
        setDocuments(docs);
      }
    }
    void load().catch(() => {
      if (active) setMessage("Could not load your profile. Please refresh the page.");
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, []);

  async function run(action: () => Promise<void>) {
    if (busy) return;
    setBusy(true);
    setMessage("");
    try {
      await action();
    } catch {
      setMessage("Could not complete the request. Refresh the page and try again.");
    } finally {
      setBusy(false);
    }
  }

  function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.firstName.trim()) {
      setMessage("First name is required.");
      return;
    }
    void run(async () => {
      const { error } = await createClient().from("profiles").update({
        first_name: form.firstName.trim(), last_name: form.lastName.trim(), phone_number: form.phone.trim() || null,
      }).eq("id", userId).select("id").single();
      setMessage(error ? "Could not save your profile. Please try again." : "Profile saved.");
    });
  }

  function changePhoto(file?: File) {
    if (!file) return;
    void run(async () => {
      const result = await uploadAvatar(file);
      setMessage(result);
      if (result !== "Photo updated.") return;
      const { data, error } = await createClient().from("profiles").select("avatar_path").eq("id", userId).single();
      const url = error ? null : await avatarUrl(data.avatar_path).catch(() => null);
      if (url) setPhoto(url);
      else setMessage("Photo updated. Refresh the page to load it.");
    });
  }

  function addDocument() {
    const file = fileInput.current?.files?.[0];
    if (!file) {
      setMessage("Choose a file to upload.");
      return;
    }
    void run(async () => {
      const result = await uploadDocument(file, documentType);
      setMessage(result);
      if (result !== "Document uploaded.") return;
      if (fileInput.current) fileInput.current.value = "";
      setDocuments(await listDocuments(userId).catch(() => null));
    });
  }

  function removeDocument(doc: WorkerDocument) {
    if (!window.confirm(`Delete ${doc.fileName}?`)) return;
    void run(async () => {
      setMessage(await deleteDocument(doc));
      setDocuments(await listDocuments(userId).catch(() => null));
    });
  }

  async function openDocument(path: string) {
    const tab = window.open("about:blank", "_blank");
    if (!tab) {
      setMessage("Allow pop-ups to open this document.");
      return;
    }
    tab.opener = null;
    const url = await openDocumentUrl(path).catch(() => null);
    if (url) tab.location.replace(url);
    else {
      tab.close();
      setMessage("Could not open this document.");
    }
  }

  if (loading) return <p role="status">Loading your profile...</p>;

  return (
    <div className={`flex flex-col gap-6 ${navy}`}>
      {message && <p role="status" className="rounded-lg border bg-white px-4 py-3 text-sm font-semibold">{message}</p>}
      {userId && <>
        <section className={`${card} flex flex-col gap-4 sm:flex-row sm:items-center`}>
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} alt="" className="size-28 rounded-full object-cover" />
          ) : (
            <span className="flex size-28 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <User className="size-12" aria-hidden />
            </span>
          )}
          <div>
            <h1 className="text-3xl font-extrabold">{[form.firstName, form.lastName].join(" ").trim() || "Your name"}</h1>
            {employeeNumber !== null && <p>Employee #{employeeNumber}</p>}
            <label className="mt-3 inline-block cursor-pointer rounded-lg bg-blue-700 px-3 py-2 text-sm text-white focus-within:ring-2">
              Change photo
              <input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" disabled={busy}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  event.target.value = "";
                  changePhoto(file);
                }} />
            </label>
          </div>
        </section>

        <form onSubmit={saveProfile} className={card}>
          <h2 className="mb-6 text-lg font-extrabold uppercase">Personal information</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            <label><span className={label}>First name</span>
              <input className={input} value={form.firstName} required maxLength={100}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
            </label>
            <label><span className={label}>Last name</span>
              <input className={input} value={form.lastName} maxLength={100}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
            </label>
            <label><span className={label}>Phone number</span>
              <input className={input} type="tel" value={form.phone} maxLength={50}
                onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </label>
            <div><span className={label}>Email address</span><p className="rounded-lg bg-slate-100 px-4 py-3 text-sm">{email || "—"}</p></div>
          </div>
          <div className="mt-6 flex justify-end"><button className={button} disabled={busy}>Save</button></div>
        </form>

        <section className={card}>
          <h2 className="mb-4 text-lg font-extrabold uppercase">Documents</h2>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <label><span className={label}>Document type</span>
              <select className={input} disabled={busy} value={documentType} onChange={(e) => setDocumentType(e.target.value as DocumentType)}>
                {DOCUMENT_TYPES.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
            <label className="min-w-0 flex-1"><span className={label}>File (PDF, JPG or PNG, up to 10 MB)</span>
              <input ref={fileInput} className="block w-full text-sm" type="file" disabled={busy} accept="application/pdf,image/jpeg,image/png" />
            </label>
            <button className={button} disabled={busy} onClick={addDocument}>Upload</button>
          </div>
          {documents?.length ? (
            <ul className="mt-6 flex flex-col gap-3">
              {documents.map((doc) => (
                <li key={doc.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[var(--document-color)] p-3">
                  <div className="min-w-0">
                    <p className="text-sm font-bold">{doc.typeLabel}</p>
                    <p className="truncate text-xs text-slate-600">{doc.fileName} · {fmtLongDate(new Date(doc.uploadedAt))}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="rounded-full border border-blue-700 px-3 py-1 text-xs font-bold text-blue-700" onClick={() => openDocument(doc.path)}>OPEN</button>
                    <button className="rounded-full border border-red-500 px-3 py-1 text-xs font-bold text-red-500" disabled={busy} onClick={() => removeDocument(doc)}>DELETE</button>
                  </div>
                </li>
              ))}
            </ul>
          ) : <p className="mt-6 text-sm text-slate-500">{documents ? "No documents uploaded yet." : "Could not load your documents. Please refresh the page."}</p>}
        </section>
      </>}
    </div>
  );
}
