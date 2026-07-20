import { api } from "./api";
import { comingSoon } from "./comingSoon";

// ── Admin authentication (Express + JWT httpOnly cookie, not Supabase Auth) ─
// NOTE: unrelated to the volunteer auth below — this is for your own site-admin
// login, still on the old backend. Leave this section alone for now.

export async function signInAdmin(email: string, password: string): Promise<{ ok: boolean; error?: string }> {
  const res = await api.post<{ ok: boolean }>("/api/auth/login", { email, password });
  if (!res.ok) return { ok: false, error: res.error };
  return { ok: true };
}

export async function signOutAdmin() {
  await api.post("/api/auth/logout");
}

export function onAdminAuthChange(cb: (loggedIn: boolean) => void): () => void {
  let cancelled = false;
  api.get<{ loggedIn: boolean }>("/api/auth/session").then((res) => {
    if (!cancelled) cb(!!res.data?.loggedIn);
  });
  return () => {
    cancelled = true;
  };
}

// ── Public form submissions (still disabled — unrelated to this change) ────

export async function saveDonation(data: {
  amount: number; name: string; email: string; phone: string;
  donation_type: "one-time" | "monthly"; anonymous: boolean;
  event_name?: string; campaign_name?: string;
}): Promise<boolean> {
  return comingSoon();
}

export async function saveReservation(data: {
  name: string; email: string; phone: string; seats: number; event_name: string;
  volunteer_commitment?: "event_only" | "ongoing";
  companions?: { name: string; phone: string }[];
}): Promise<boolean> {
  return comingSoon();
}

export async function saveVendor(data: {
  business_name: string; contact_name: string; email: string; phone: string;
  offering: string; needs_space: boolean; event_name: string;
}): Promise<boolean> {
  return comingSoon();
}

export async function saveVolunteer(data: {
  name: string; email: string; phone: string; skills: string; selected_events: string[];
}): Promise<boolean> {
  return comingSoon();
}

export async function saveContact(data: {
  name: string; email: string; phone?: string; subject?: string; message: string;
}): Promise<boolean> {
  return comingSoon();
}

// ── Volunteer accounts — now wired to Strapi's Users & Permissions plugin ──

export type VolunteerAccountProfile = { name: string; email: string; phone: string; skills: string };

// Strapi's local auth stores the JWT client-side (no server session/cookie like the
// admin auth above) — save it so future authenticated requests can use it, and so a
// page reload can restore the session instead of forcing a fresh login every time.
const VOLUNTEER_TOKEN_KEY = "mahila_volunteer_jwt";

export function getVolunteerToken(): string | null {
  return localStorage.getItem(VOLUNTEER_TOKEN_KEY);
}

function setVolunteerToken(jwt: string) {
  localStorage.setItem(VOLUNTEER_TOKEN_KEY, jwt);
}

export function clearVolunteerToken() {
  localStorage.removeItem(VOLUNTEER_TOKEN_KEY);
}

function toProfile(user: any): VolunteerAccountProfile {
  return {
    name: user?.name ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    skills: user?.skills ?? "",
  };
}

export async function registerVolunteer(data: {
  name: string;
  email: string;
  phone: string;
  password: string;
  skills?: string;
}): Promise<{ ok: boolean; profile?: VolunteerAccountProfile; error?: string }> {
  // Strapi's User model requires a `username` — reuse the email, since it must be
  // unique anyway and there's no separate "pick a username" step in your UI.
  const res = await api.post<{ jwt: string; user: any }>("/api/auth/local/register", {
    username: data.email,
    email: data.email,
    password: data.password,
    name: data.name,
    phone: data.phone,
    skills: data.skills ?? "",
  });
  if (!res.ok || !res.data) {
    // Strapi's default message here is "Email or Username are already taken" —
    // that already covers "one user can't create multiple accounts" for email.
    return { ok: false, error: res.error };
  }
  setVolunteerToken(res.data.jwt);
  return { ok: true, profile: toProfile(res.data.user) };
}

export async function loginVolunteer(
  email: string,
  password: string
): Promise<{ ok: boolean; profile?: VolunteerAccountProfile; error?: string }> {
  const res = await api.post<{ jwt: string; user: any }>("/api/auth/local", {
    identifier: email,
    password,
  });
  if (!res.ok || !res.data) return { ok: false, error: res.error };
  setVolunteerToken(res.data.jwt);
  return { ok: true, profile: toProfile(res.data.user) };
}

export async function requestVolunteerPasswordReset(email: string): Promise<{ ok: boolean; error?: string }> {
  const res = await api.post<{ ok: boolean }>("/api/auth/forgot-password", { email });
  // Strapi returns 200 here whether or not the email is registered (deliberately,
  // so this can't be used to probe for existing accounts) — matches what the UI expects.
  if (!res.ok) return { ok: false, error: res.error };
  return { ok: true };
}

export async function resetVolunteerPassword(
  token: string,
  password: string
): Promise<{ ok: boolean; profile?: VolunteerAccountProfile; error?: string }> {
  const res = await api.post<{ jwt: string; user: any }>("/api/auth/reset-password", {
    code: token,
    password,
    passwordConfirmation: password,
  });
  if (!res.ok || !res.data) return { ok: false, error: res.error };
  setVolunteerToken(res.data.jwt);
  return { ok: true, profile: toProfile(res.data.user) };
}

export function logoutVolunteer() {
  clearVolunteerToken();
}