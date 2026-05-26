const planModel = require('../models/planModel');
const productFeatureModel = require('../models/productFeatureModel');
const siteDetailModel = require('../models/siteDetailModel');
const { success } = require('../utils/response');

// Public, no-auth endpoint that aggregates everything a marketing brochure
// needs in one shot: branding (site details), live pricing plans, and the
// product feature catalog grouped by category. Returning a single payload
// keeps the brochure page snappy (one round trip) and gives PDF generation
// a single canonical input.

const CACHE_TTL_MS = 5 * 60 * 1000;
let cache = { payload: null, expires: 0 };

const pickPrimary = (rows = []) => {
  if (!Array.isArray(rows) || !rows.length) return null;
  return rows.find((r) => Boolean(r?.is_primary)) || rows[0] || null;
};

const normalizeBrand = (row) => {
  if (!row) {
    return {
      name: 'TheChatNest',
      tagline: '',
      logo_url: '',
      mascot_url: '',
      website_url: '',
      email: '',
      phone: '',
      address: '',
      social: {},
    };
  }
  const primaryEmail = pickPrimary(row.emails)?.email_address || '';
  const primaryPhone = pickPrimary(row.phones)?.phone_number || '';
  const primaryAddress = pickPrimary(row.addresses);
  const address = primaryAddress
    ? [
        primaryAddress.address_line_1,
        primaryAddress.address_line_2,
        primaryAddress.city,
        primaryAddress.state,
        primaryAddress.country,
        primaryAddress.postal_code,
      ]
        .map((v) => String(v || '').trim())
        .filter(Boolean)
        .join(', ')
    : '';

  return {
    name: String(row.brand_name || 'TheChatNest').trim(),
    tagline: String(row.tagline || row.short_description || '').trim(),
    logo_url: String(row.logo_url || '').trim(),
    mascot_url: String(row.mascot_url || '').trim(),
    website_url: String(row.website_url || '').trim(),
    email: String(primaryEmail).trim(),
    phone: String(primaryPhone).trim(),
    address,
    social: {
      facebook: String(row.google_plus_url || '').trim(),
      twitter: String(row.twitter_url || '').trim(),
      linkedin: String(row.linkedin_url || '').trim(),
      youtube: String(row.youtube_url || '').trim(),
    },
  };
};

const cycleLabel = (intervalDays) => {
  const days = Number(intervalDays || 0);
  if (!days) return 'monthly';
  if (days >= 350) return 'yearly';
  if (days >= 80) return 'quarterly';
  if (days >= 25) return 'monthly';
  return `${days}-day`;
};

const normalizePlan = (row) => {
  const price = Number(row?.price || 0);
  const storageMb = Number(row?.max_storage_mb || 0);
  const storageLabel =
    storageMb >= 1000
      ? `${Math.round(storageMb / 1000)} GB`
      : storageMb > 0
        ? `${storageMb} MB`
        : 'Unlimited';
  const maxUsers = Number(row?.max_users || 0);
  const interval = Number(row?.interval_days || 30);

  return {
    plan_id: row.plan_id,
    plan_key: row.plan_key,
    name: row.plan_name || row.plan_key,
    price,
    currency: String(row.default_currency || 'INR').toUpperCase(),
    interval_days: interval,
    billing_cycle: cycleLabel(interval),
    max_users: maxUsers || null,
    storage_label: storageLabel,
    is_free: price === 0,
    perks: [
      maxUsers ? `Up to ${maxUsers.toLocaleString()} users` : 'Unlimited users',
      `${storageLabel} storage per user`,
      'Unlimited 1:1 & group chat',
      'HD audio & video calls',
      'AI assistant & file search',
    ],
  };
};

const normalizeFeatureCatalog = (catalog = []) =>
  catalog
    .filter((cat) => String(cat?.status || '').toLowerCase() !== 'inactive')
    .map((cat) => ({
      category_key: cat.category_key,
      category_label: cat.category_label,
      items: (cat.items || [])
        .filter((it) => String(it?.status || '').toLowerCase() !== 'inactive')
        .map((it) => ({
          title: it.title,
          description: it.description,
          icon_url: it.icon_url,
        })),
    }))
    .filter((cat) => cat.items.length > 0);

const buildPayload = async () => {
  const [siteDetails, plansResult, catalog] = await Promise.all([
    siteDetailModel.findAll(),
    planModel.findAll({ limit: 50, offset: 0 }),
    productFeatureModel.findCatalog({ status: 'active' }),
  ]);

  const activeSite =
    (siteDetails || []).find(
      (r) => String(r?.status || '').toLowerCase() === 'active'
    ) ||
    (siteDetails || [])[0] ||
    null;

  const plans = (plansResult?.rows || [])
    .filter((p) => String(p?.status || '').toLowerCase() !== 'inactive')
    .sort((a, b) => Number(a?.price || 0) - Number(b?.price || 0))
    .map(normalizePlan);

  return {
    brand: normalizeBrand(activeSite),
    plans,
    feature_categories: normalizeFeatureCatalog(catalog),
    trust: [
      { label: 'AES-256-GCM', icon: '🔒' },
      { label: 'SOC 2 Ready', icon: '✅' },
      { label: 'GDPR Compliant', icon: '🇪🇺' },
      { label: '99.9% Uptime', icon: '⚡' },
      { label: '24/7 Support', icon: '💚' },
    ],
    generated_at: new Date().toISOString(),
    version: 'v1',
  };
};

const getBrochureData = async (req, res, next) => {
  try {
    const now = Date.now();
    const bypass = String(req.query.fresh || '') === '1';
    if (!bypass && cache.payload && cache.expires > now) {
      return success(res, cache.payload, 'Brochure data (cached)');
    }

    const payload = await buildPayload();
    cache = { payload, expires: now + CACHE_TTL_MS };
    return success(res, payload, 'Brochure data retrieved');
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getBrochureData,
};
