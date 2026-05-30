// Razorpay Sync — read-only views into the live Razorpay account so the
// Owner can browse payments / orders / refunds / settlements without
// leaving the dashboard. Uses the same key_id + key_secret that powers
// the checkout flow (resolved from payment_gateways.config_json).
//
// All endpoints below are GET-only except issueRefund which is POST.
// All require auth + non-role-4 (same gate as billing routes).

const { success } = require('../utils/response');
const billingModel = require('../models/billingModel');
const { decryptSecretValue } = require('../utils/paymentGatewaySecrets');

const RAZORPAY_API_BASE = 'https://api.razorpay.com/v1';

const asPlainObject = (value) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return value;
};

const pickFirstDefinedString = (sources = []) => {
  for (const source of sources) {
    const text = String(source ?? '').trim();
    if (text) return text;
  }
  return '';
};

const readDecryptedCredential = (config = {}, keys = []) => {
  for (const key of keys) {
    const parts = String(key || '').split('.');
    let cursor = config;
    for (const part of parts) {
      if (!cursor || typeof cursor !== 'object' || !(part in cursor)) { cursor = undefined; break; }
      cursor = cursor[part];
    }
    const text = String(cursor ?? '').trim();
    if (!text) continue;
    try {
      return decryptSecretValue(text, { allowPlain: true });
    } catch {
      // fall through and try next key — corrupt secret on one slot
      // shouldn't kill the whole lookup
    }
  }
  return '';
};

// Walk the same account/mode/credentials shape billingController uses
// when minting orders. Falls back to env vars so this controller works
// even before the owner has configured a gateway row.
const resolveRazorpayCreds = async () => {
  const row = await billingModel.findPaymentGatewayByKey('razorpay').catch(() => null);
  const config = asPlainObject(row?.config_json);
  const accounts = Array.isArray(config.accounts) ? config.accounts : [];
  const activeMode = String(config.active_mode || config.activeMode || 'sandbox').toLowerCase() === 'live'
    ? 'live'
    : 'sandbox';
  const account =
    accounts.find((a) => a?.is_default) ||
    accounts.find((a) => String(a?.status || 'active').toLowerCase() !== 'inactive') ||
    accounts[0] ||
    {};
  const modeConfig = asPlainObject(account?.[activeMode] || account?.modes?.[activeMode]);
  const credSources = {
    ...asPlainObject(config.credentials),
    ...asPlainObject(config[activeMode]),
    ...asPlainObject(account?.config),
    ...modeConfig,
  };

  const keyId = pickFirstDefinedString([
    readDecryptedCredential(credSources, ['key_id', 'keyId', 'razorpay_key_id']),
    process.env.RAZORPAY_KEY_ID,
  ]);
  const keySecret = pickFirstDefinedString([
    readDecryptedCredential(credSources, ['key_secret', 'keySecret', 'razorpay_key_secret']),
    process.env.RAZORPAY_KEY_SECRET,
  ]);
  if (!keyId || !keySecret) {
    const err = new Error(
      'Razorpay is not configured. Add key_id + key_secret in Owner Dashboard → Payment Gateways → Razorpay first.'
    );
    err.status = 503;
    throw err;
  }
  return { keyId, keySecret, mode: activeMode };
};

const razorpayGet = async (pathFragment, query = {}) => {
  const { keyId, keySecret } = await resolveRazorpayCreds();
  const qs = Object.entries(query)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&');
  const url = `${RAZORPAY_API_BASE}${pathFragment}${qs ? `?${qs}` : ''}`;
  const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
  const response = await fetch(url, {
    method: 'GET',
    headers: { Authorization: `Basic ${auth}`, Accept: 'application/json' },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const err = new Error(
      String(payload?.error?.description || payload?.error?.reason || `Razorpay API ${response.status}`)
    );
    err.status = Number(response.status || 502);
    err.code = String(payload?.error?.code || '').trim() || null;
    throw err;
  }
  return payload;
};

const razorpayPost = async (pathFragment, body = {}) => {
  const { keyId, keySecret } = await resolveRazorpayCreds();
  const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
  const response = await fetch(`${RAZORPAY_API_BASE}${pathFragment}`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(body),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const err = new Error(
      String(payload?.error?.description || payload?.error?.reason || `Razorpay API ${response.status}`)
    );
    err.status = Number(response.status || 502);
    err.code = String(payload?.error?.code || '').trim() || null;
    throw err;
  }
  return payload;
};

// Razorpay returns timestamps as Unix seconds; convert to ms/ISO for the UI.
const decorate = (item) => {
  if (!item || typeof item !== 'object') return item;
  const out = { ...item };
  ['created_at', 'authorized_at', 'captured_at', 'refunded_at', 'settled_at', 'updated_at'].forEach((key) => {
    if (typeof out[key] === 'number') {
      out[`${key}_iso`] = new Date(out[key] * 1000).toISOString();
    }
  });
  // Amounts in smallest unit → also return major for display
  ['amount', 'amount_paid', 'amount_due', 'amount_refunded', 'fee', 'tax'].forEach((key) => {
    if (typeof out[key] === 'number') {
      out[`${key}_major`] = Number((out[key] / 100).toFixed(2));
    }
  });
  return out;
};

const parsePagination = (q = {}) => {
  const count = Math.min(100, Math.max(1, Number(q.count) || 25));
  const skip = Math.max(0, Number(q.skip) || 0);
  // Optional from/to as YYYY-MM-DD or ISO; Razorpay wants Unix seconds.
  const toUnix = (v) => {
    if (!v) return undefined;
    const t = new Date(v).getTime();
    return Number.isFinite(t) ? Math.floor(t / 1000) : undefined;
  };
  return { count, skip, from: toUnix(q.from), to: toUnix(q.to) };
};

// GET /billing/razorpay/payments?count=25&skip=0&from=YYYY-MM-DD&to=YYYY-MM-DD
const listPayments = async (req, res, next) => {
  try {
    const { count, skip, from, to } = parsePagination(req.query);
    const data = await razorpayGet('/payments', { count, skip, from, to });
    const items = Array.isArray(data?.items) ? data.items.map(decorate) : [];
    return success(res, { count: data?.count ?? items.length, items }, 'Razorpay payments fetched');
  } catch (err) { return next(err); }
};

// GET /billing/razorpay/payments/:id
const fetchPayment = async (req, res, next) => {
  try {
    const id = String(req.params.id || '').trim();
    if (!id) { const e = new Error('payment id required'); e.status = 400; throw e; }
    const data = await razorpayGet(`/payments/${encodeURIComponent(id)}`);
    return success(res, decorate(data), 'Razorpay payment fetched');
  } catch (err) { return next(err); }
};

// GET /billing/razorpay/orders?count=25&skip=0
const listOrders = async (req, res, next) => {
  try {
    const { count, skip, from, to } = parsePagination(req.query);
    const data = await razorpayGet('/orders', { count, skip, from, to });
    const items = Array.isArray(data?.items) ? data.items.map(decorate) : [];
    return success(res, { count: data?.count ?? items.length, items }, 'Razorpay orders fetched');
  } catch (err) { return next(err); }
};

// GET /billing/razorpay/refunds?count=25&skip=0
const listRefunds = async (req, res, next) => {
  try {
    const { count, skip, from, to } = parsePagination(req.query);
    const data = await razorpayGet('/refunds', { count, skip, from, to });
    const items = Array.isArray(data?.items) ? data.items.map(decorate) : [];
    return success(res, { count: data?.count ?? items.length, items }, 'Razorpay refunds fetched');
  } catch (err) { return next(err); }
};

// GET /billing/razorpay/settlements?count=25&skip=0
const listSettlements = async (req, res, next) => {
  try {
    const { count, skip, from, to } = parsePagination(req.query);
    const data = await razorpayGet('/settlements', { count, skip, from, to });
    const items = Array.isArray(data?.items) ? data.items.map(decorate) : [];
    return success(res, { count: data?.count ?? items.length, items }, 'Razorpay settlements fetched');
  } catch (err) { return next(err); }
};

// POST /billing/razorpay/payments/:id/refund  body: { amount?, notes? }
// amount in MAJOR units (rupees). Omit to refund the full captured amount.
const issueRefund = async (req, res, next) => {
  try {
    const id = String(req.params.id || '').trim();
    if (!id) { const e = new Error('payment id required'); e.status = 400; throw e; }
    const amountMajor = req.body?.amount;
    const body = {};
    if (amountMajor !== undefined && amountMajor !== null && amountMajor !== '') {
      const n = Number(amountMajor);
      if (!Number.isFinite(n) || n <= 0) {
        const e = new Error('amount must be a positive number in major units (rupees)');
        e.status = 400;
        throw e;
      }
      body.amount = Math.round(n * 100);
    }
    if (req.body?.notes && typeof req.body.notes === 'object') body.notes = req.body.notes;
    body.speed = String(req.body?.speed || 'normal').toLowerCase() === 'optimum' ? 'optimum' : 'normal';
    const data = await razorpayPost(`/payments/${encodeURIComponent(id)}/refund`, body);
    return success(res, decorate(data), 'Razorpay refund initiated');
  } catch (err) { return next(err); }
};

// GET /billing/razorpay/account — quick "is razorpay configured + responding"
// summary for the panel header (account id, mode, name) without making the
// owner page guess from individual error responses.
const getAccountSummary = async (req, res, next) => {
  try {
    const { keyId, mode } = await resolveRazorpayCreds();
    // Cheapest health check — fetch 1 payment. If keys are wrong we get a 401.
    let healthy = false;
    let lastError = null;
    try {
      await razorpayGet('/payments', { count: 1 });
      healthy = true;
    } catch (e) {
      lastError = e.message;
    }
    return success(res, {
      key_id_prefix: keyId.slice(0, 12),
      mode,
      healthy,
      last_error: lastError,
    }, 'Razorpay account summary');
  } catch (err) { return next(err); }
};

module.exports = {
  listPayments,
  fetchPayment,
  listOrders,
  listRefunds,
  listSettlements,
  issueRefund,
  getAccountSummary,
};
