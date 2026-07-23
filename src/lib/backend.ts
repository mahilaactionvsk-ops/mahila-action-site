import { api } from "./api";

// ── Admin authentication (Express + JWT httpOnly cookie, not Supabase Auth) ─

export async function signInAdmin(email: string, password: string): Promise<{ ok: boolean; error?: string }> {
  const res = await api.post<{ ok: boolean }>("/api/auth/login", { email, password });
  if (!res.ok) return { ok: false, error: res.error };
  return { ok: true };
}

export async function signOutAdmin() {
  await api.post("/api/auth/logout");
}

// Calls `cb(true)`/`cb(false)` immediately with current session state. There's no
// realtime push from the server, so this checks once on mount; call it again after
// login/logout if you need an immediate refresh instead of waiting for a reload.
export function onAdminAuthChange(cb: (loggedIn: boolean) => void): () => void {
  let cancelled = false;
  api.get<{ loggedIn: boolean }>("/api/auth/session").then((res) => {
    if (!cancelled) cb(!!res.data?.loggedIn);
  });
  return () => {
    cancelled = true;
  };
}

// ── Public form submissions ──────────────────────────────────────────────

export async function saveDonation(data: {
  amount: number;
  name: string;
  email: string;
  phone: string;

  anonymous: boolean;
  event_name?: string;
  campaign_name?: string;
}): Promise<boolean> {
  const res = await api.post("/api/donations", data);
  if (!res.ok) console.error("saveDonation:", res.error);
  return res.ok;
}

export async function saveReservation(data: {
  name: string;
  email: string;
  phone: string;
  seats: number;
  event_name: string;
  volunteer_commitment?: "event_only" | "ongoing";
  companions?: { name: string; phone: string }[];
}): Promise<boolean> {
  const res = await api.post("/api/reservations", data);
  if (!res.ok) console.error("saveReservation:", res.error);
  return res.ok;
}

export async function saveVendor(data: {
  business_name: string;
  contact_name: string;
  email: string;
  phone: string;
  offering: string;
  needs_space: boolean;
  event_name: string;
}): Promise<boolean> {
  const res = await api.post("/api/vendors", data);
  if (!res.ok) console.error("saveVendor:", res.error);
  return res.ok;
}

export async function saveVolunteer(data: {
  name: string;
  email: string;
  phone: string;
  skills: string;
  selected_events: string[];
}): Promise<boolean> {
  const res = await api.post("/api/volunteers", data);
  if (!res.ok) console.error("saveVolunteer:", res.error);
  return res.ok;
}

export async function saveContact(data: {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}): Promise<boolean> {
  const res = await api.post("/api/contact", data);
  if (!res.ok) console.error("saveContact:", res.error);
  return res.ok;
}

// ── Volunteer accounts (real, persisted — distinct from admin auth) ────────

export type VolunteerAccountProfile = { name: string; email: string; phone: string; skills: string };

export async function registerVolunteer(data: {
  name: string;
  email: string;
  phone: string;
  password: string;
  skills?: string;
}): Promise<{ ok: boolean; profile?: VolunteerAccountProfile; error?: string }> {
  const res = await api.post<{ ok: boolean; profile: VolunteerAccountProfile }>("/api/volunteer-auth/register", data);
  if (!res.ok) return { ok: false, error: res.error };
  return { ok: true, profile: res.data?.profile };
}

export async function loginVolunteer(
  email: string,
  password: string
): Promise<{ ok: boolean; profile?: VolunteerAccountProfile; error?: string }> {
  const res = await api.post<{ ok: boolean; profile: VolunteerAccountProfile }>("/api/volunteer-auth/login", { email, password });
  if (!res.ok) return { ok: false, error: res.error };
  return { ok: true, profile: res.data?.profile };
}

export async function requestVolunteerPasswordReset(email: string): Promise<{ ok: boolean; error?: string }> {
  const res = await api.post<{ ok: boolean; message: string }>("/api/volunteer-auth/forgot-password", { email });
  if (!res.ok) return { ok: false, error: res.error };
  return { ok: true };
}

export async function resetVolunteerPassword(
  token: string,
  password: string
): Promise<{ ok: boolean; profile?: VolunteerAccountProfile; error?: string }> {
  const res = await api.post<{ ok: boolean; profile: VolunteerAccountProfile }>("/api/volunteer-auth/reset-password", { token, password });
  if (!res.ok) return { ok: false, error: res.error };
  return { ok: true, profile: res.data?.profile };
}