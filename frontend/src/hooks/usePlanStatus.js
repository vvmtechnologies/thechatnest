import { useEffect, useState } from "react";
import { API_BASE_URL } from "../config/apiBaseUrl";
import { fetchWithAuth } from "../utils/authApi";

/**
 * Lightweight hook for the topbar plan countdown chip.
 *
 * Returns:
 *   { loaded, status, planName, remainingDays, endDate, expired }
 *
 * status ∈ "active" | "trial" | "expiring" | "expired" | "unknown"
 *
 * Caches result on the module so multiple consumers don't refetch within
 * a short window.
 */
let cache = null;
let inflight = null;
const TTL_MS = 5 * 60 * 1000; // 5 minutes

const parseDate = (value) => {
  if (!value) return null;
  const d = new Date(value);
  return Number.isFinite(d.getTime()) ? d : null;
};

const computeRemainingDays = (endDate) => {
  const end = parseDate(endDate);
  if (!end) return null;
  const diffMs = end.getTime() - Date.now();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
};

const normalize = (payload) => {
  const data = payload?.data || payload || {};
  const plan = data.current_plan || data.plan || data.subscription || {};
  const endDate =
    plan.end_date ||
    plan.expires_at ||
    plan.expiry_date ||
    plan.trial_end_at ||
    null;
  const planName = String(
    plan.plan_name || plan.plan_key || plan.name || ""
  ).trim();
  const rawStatus = String(
    plan.subscription_status || plan.status || ""
  ).toLowerCase();
  const remainingDays = computeRemainingDays(endDate);
  const isTrial =
    rawStatus === "trial" ||
    /trial/i.test(planName) ||
    Number(plan.price || 0) === 0;
  const expired =
    rawStatus === "expired" ||
    rawStatus === "cancelled" ||
    rawStatus === "canceled" ||
    (remainingDays !== null && remainingDays <= 0);

  let status = "active";
  if (expired) status = "expired";
  else if (remainingDays !== null && remainingDays <= 7) status = "expiring";
  else if (isTrial) status = "trial";
  if (!planName && remainingDays === null && rawStatus === "") status = "unknown";

  return {
    loaded: true,
    status,
    planName: planName || "Plan",
    remainingDays,
    endDate,
    expired,
  };
};

// Wipe the module-local plan cache so the next consumer (or the same
// hook's effect after re-mount) refetches from /auth/organization-details
// instead of returning the stale "expired" snapshot from before renewal.
// Called by the billing flow on successful payment confirmation.
export const invalidatePlanStatusCache = () => {
  cache = null;
  inflight = null;
};

const fetchPlan = async () => {
  if (!API_BASE_URL) return { loaded: true, status: "unknown" };
  try {
    const { response, payload } = await fetchWithAuth(
      `${API_BASE_URL}/auth/organization-details`,
      { method: "GET" }
    );
    if (!response?.ok) return { loaded: true, status: "unknown" };
    const result = normalize(payload);
    cache = { value: result, at: Date.now() };
    return result;
  } catch {
    return { loaded: true, status: "unknown" };
  }
};

const usePlanStatus = () => {
  const [state, setState] = useState(() => {
    if (cache && Date.now() - cache.at < TTL_MS) return cache.value;
    return { loaded: false, status: "unknown" };
  });

  useEffect(() => {
    if (cache && Date.now() - cache.at < TTL_MS) {
      setState(cache.value);
      return;
    }
    if (!inflight) inflight = fetchPlan().finally(() => (inflight = null));
    let cancelled = false;
    inflight.then((res) => {
      if (!cancelled) setState(res);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
};

export default usePlanStatus;
