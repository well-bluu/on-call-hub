import { createClient } from "@/lib/supabase/client";

export const DOCUMENT_TYPES = [
  { value: "nbi_clearance", label: "NBI Clearance" },
  { value: "medical_certificate", label: "Medical Certificate" },
  { value: "philhealth", label: "PhilHealth" },
  { value: "other", label: "Other" },
] as const;

export type DocumentType = (typeof DOCUMENT_TYPES)[number]["value"];

export interface WorkerDocument {
  id: string;
  typeLabel: string;
  fileName: string;
  path: string;
  uploadedAt: string;
}

const DOCUMENT_MIME_TYPES = ["application/pdf", "image/jpeg", "image/png"];
const AVATAR_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

function safeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-100);
}

export async function listDocuments(
  workerId: string,
): Promise<WorkerDocument[]> {
  const { data, error } = await createClient()
    .from("worker_documents")
    .select("id, document_type, file_name, storage_path, uploaded_at")
    .eq("worker_id", workerId)
    .order("uploaded_at", { ascending: false });
  if (error) throw error;

  return data.map((row) => ({
    id: row.id,
    typeLabel:
      DOCUMENT_TYPES.find((type) => type.value === row.document_type)?.label ??
      "Other",
    fileName: row.file_name,
    path: row.storage_path,
    uploadedAt: row.uploaded_at,
  }));
}

export async function uploadDocument(
  file: File,
  type: DocumentType,
): Promise<string> {
  if (!DOCUMENT_MIME_TYPES.includes(file.type))
    return "Upload a PDF, JPG or PNG file.";
  if (file.size > 10 * 1024 * 1024) return "Files must be 10 MB or smaller.";

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return "Please sign in again.";

  const bucket = supabase.storage.from("worker-documents");
  const path = `${user.id}/${crypto.randomUUID()}-${safeFileName(file.name)}`;
  const { error: uploadError } = await bucket.upload(path, file, {
    contentType: file.type,
  });
  if (uploadError) return "Could not upload the file. Please try again.";

  const { error } = await supabase.from("worker_documents").insert({
    worker_id: user.id,
    document_type: type,
    file_name: file.name.slice(0, 255),
    storage_path: path,
  });
  if (error) {
    await bucket.remove([path]);
    return "Could not save the document. Please try again.";
  }
  return "Document uploaded.";
}

export async function openDocumentUrl(path: string): Promise<string | null> {
  const { data, error } = await createClient()
    .storage.from("worker-documents")
    .createSignedUrl(path, 60);
  return error ? null : data.signedUrl;
}
export async function deleteDocument(
  document: WorkerDocument,
): Promise<string> {
  const supabase = createClient();

  // File first: if this fails, the row stays and the worker can try again.
  const { error: storageError } = await supabase.storage
    .from("worker-documents")
    .remove([document.path]);
  if (storageError) return "Could not delete the file. Please try again.";

  // .select() returns the rows actually deleted, so a blocked delete isn't reported as success.
  const { data: deleted, error } = await supabase
    .from("worker_documents")
    .delete()
    .eq("id", document.id)
    .select("id");
  if (error || !deleted?.length) return "Could not delete the document.";

  return "Document deleted.";
}

export async function uploadAvatar(file: File): Promise<string> {
  if (!AVATAR_MIME_TYPES.includes(file.type))
    return "Use a JPG, PNG or WEBP image.";
  if (file.size > 2 * 1024 * 1024) return "Photos must be 2 MB or smaller.";

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return "Please sign in again.";

  // Remember the current photo so it can be removed once the new one is saved.
  const { data: profile } = await supabase
    .from("profiles")
    .select("avatar_path")
    .eq("id", user.id)
    .single();
  const oldPath = profile?.avatar_path ?? null;

  const extension = file.type.split("/")[1];
  const path = `${user.id}/avatar-${Date.now()}.${extension}`;
  const bucket = supabase.storage.from("avatars");
  const { error: uploadError } = await bucket.upload(path, file, {
    contentType: file.type,
  });
  if (uploadError) return "Could not upload the photo. Please try again.";

  const { error } = await supabase
    .from("profiles")
    .update({ avatar_path: path })
    .eq("id", user.id);
  if (error) {
    await bucket.remove([path]);
    return "Could not save the photo. Please try again.";
  }

  // The new photo is saved; delete the old one so owners can no longer open it.
  if (oldPath && oldPath !== path) await bucket.remove([oldPath]);
  return "Photo updated.";
}

export async function avatarUrl(path: string | null): Promise<string | null> {
  if (!path) return null;
  const { data, error } = await createClient()
    .storage.from("avatars")
    .createSignedUrl(path, 3600);
  return error ? null : data.signedUrl;
}
