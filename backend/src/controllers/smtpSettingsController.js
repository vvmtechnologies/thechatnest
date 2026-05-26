const nodemailer = require('nodemailer');
const smtpSettingsModel = require('../models/smtpSettingsModel');
const { invalidateTransporterCache } = require('../utils/mail');
const { success } = require('../utils/response');

const parseId = (value) => {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    const err = new Error('Valid smtp_settings_id is required');
    err.status = 400;
    throw err;
  }
  return id;
};

const validatePort = (port) => {
  const p = Number(port);
  if (!Number.isInteger(p) || p < 1 || p > 65535) {
    const err = new Error('port must be a valid port number (1–65535)');
    err.status = 400;
    throw err;
  }
  return p;
};

const getAllSmtpSettings = async (req, res, next) => {
  try {
    const rows = await smtpSettingsModel.findAll();
    return success(res, rows, 'SMTP settings retrieved');
  } catch (error) {
    return next(error);
  }
};

const createSmtpSettings = async (req, res, next) => {
  try {
    const { label, host, port, secure, smtp_user, smtp_pass, from_address, contact_notify_to } = req.body;

    if (!host || !String(host).trim()) {
      const err = new Error('host is required'); err.status = 400; throw err;
    }
    if (!smtp_user || !String(smtp_user).trim()) {
      const err = new Error('smtp_user is required'); err.status = 400; throw err;
    }

    const payload = {
      label: String(label || 'Default').trim(),
      host: String(host).trim(),
      port: port !== undefined ? validatePort(port) : 587,
      secure: secure === true || String(secure) === 'true',
      smtp_user: String(smtp_user).trim(),
      smtp_pass: smtp_pass ? String(smtp_pass) : '',
      from_address: from_address ? String(from_address).trim() : '',
      contact_notify_to: contact_notify_to ? String(contact_notify_to).trim() : '',
    };

    const created = await smtpSettingsModel.create(payload);
    return success(res, created, 'SMTP settings created', 201);
  } catch (error) {
    return next(error);
  }
};

const updateSmtpSettings = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    const payload = {};
    const allowed = ['label', 'host', 'port', 'secure', 'smtp_user', 'smtp_pass', 'from_address', 'contact_notify_to', 'status'];

    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        payload[key] = req.body[key];
      }
    }

    // Keep existing password if client sends back the mask
    if (payload.smtp_pass === '********') delete payload.smtp_pass;

    if (payload.port !== undefined) payload.port = validatePort(payload.port);
    if (payload.secure !== undefined) payload.secure = payload.secure === true || String(payload.secure) === 'true';
    if (payload.label !== undefined) payload.label = String(payload.label).trim();
    if (payload.host !== undefined) payload.host = String(payload.host).trim();
    if (payload.smtp_user !== undefined) payload.smtp_user = String(payload.smtp_user).trim();
    if (payload.status !== undefined) {
      const normalizedStatus = String(payload.status || '').trim().toLowerCase();
      if (!['active', 'inactive'].includes(normalizedStatus)) {
        const err = new Error('status must be active or inactive');
        err.status = 400;
        throw err;
      }
      payload.status = normalizedStatus;
    }

    const requestedStatus = payload.status;
    if (requestedStatus === 'active') {
      delete payload.status;
    }

    const updated = await smtpSettingsModel.updateById(id, payload);
    if (!updated) {
      const err = new Error('SMTP config not found'); err.status = 404; throw err;
    }

    if (requestedStatus === 'active') {
      const rows = await smtpSettingsModel.activateById(id);
      if (!rows) {
        const err = new Error('SMTP config not found'); err.status = 404; throw err;
      }
      invalidateTransporterCache();
      const activeRow = rows.find((row) => row.smtp_settings_id === id) || updated;
      return success(res, activeRow, 'SMTP settings updated');
    }

    // Clear cache so next email picks up new settings if this was the active config
    invalidateTransporterCache();

    return success(res, updated, 'SMTP settings updated');
  } catch (error) {
    return next(error);
  }
};

const activateSmtpSettings = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    const rows = await smtpSettingsModel.activateById(id);
    if (!rows) {
      const err = new Error('SMTP config not found'); err.status = 404; throw err;
    }

    // Clear cache so next email uses newly activated config
    invalidateTransporterCache();

    return success(res, rows, 'SMTP config activated');
  } catch (error) {
    return next(error);
  }
};

const deleteSmtpSettings = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    await smtpSettingsModel.deleteById(id);
    invalidateTransporterCache();
    return success(res, null, 'SMTP config deleted');
  } catch (error) {
    return next(error);
  }
};

// Verify a saved SMTP config by opening a real connection and sending a
// throwaway test message. The owner can hit this from the Owner Dashboard
// to confirm a host / port / credentials combination works BEFORE the
// app starts using it for real auth / contact / notification mail.
// Body: { to?: string, override?: { host, port, secure, smtp_user, smtp_pass, from_address } }
// `override` lets the UI test unsaved form values; if omitted, we use the
// stored row (with the real password from the DB).
const TEST_TIMEOUT_MS = 15000;

const testSmtpSettings = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    const stored = await smtpSettingsModel.findById(id);
    if (!stored) {
      const err = new Error('SMTP config not found');
      err.status = 404;
      throw err;
    }

    const override = req.body?.override && typeof req.body.override === 'object' ? req.body.override : null;
    const config = {
      host: String((override?.host ?? stored.host) || '').trim(),
      port: Number(override?.port ?? stored.port) || 587,
      secure: override
        ? override.secure === true || String(override.secure) === 'true'
        : Boolean(stored.secure),
      smtp_user: String((override?.smtp_user ?? stored.smtp_user) || '').trim(),
      // If override password is empty or the masked placeholder, fall back
      // to the stored real password so "Send test" works straight after a
      // round-trip without forcing the user to retype.
      smtp_pass: (() => {
        if (!override) return stored.smtp_pass || '';
        const v = override.smtp_pass;
        if (v === undefined || v === null || v === '' || v === '********') return stored.smtp_pass || '';
        return String(v);
      })(),
      from_address: String((override?.from_address ?? stored.from_address) || stored.smtp_user || '').trim(),
    };

    if (!config.host) {
      const err = new Error('SMTP host is required to send a test'); err.status = 400; throw err;
    }
    if (!config.smtp_user) {
      const err = new Error('SMTP username is required to send a test'); err.status = 400; throw err;
    }

    const requestedTo = String(req.body?.to || '').trim();
    const recipient =
      requestedTo ||
      String(stored.contact_notify_to || '').split(',').map((s) => s.trim()).filter(Boolean)[0] ||
      String(req.user?.email || '').trim() ||
      config.smtp_user;

    if (!recipient) {
      const err = new Error('No recipient available for the test email'); err.status = 400; throw err;
    }

    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      connectionTimeout: TEST_TIMEOUT_MS,
      greetingTimeout: TEST_TIMEOUT_MS,
      socketTimeout: TEST_TIMEOUT_MS,
      auth: { user: config.smtp_user, pass: config.smtp_pass },
    });

    // verify() catches "bad credentials" / "connection refused" before
    // we attempt sendMail — gives a cleaner error message back to the UI.
    await transporter.verify();

    const info = await transporter.sendMail({
      from: config.from_address || config.smtp_user,
      to: recipient,
      subject: 'TheChatNest — SMTP test',
      text:
        `This is a test email from TheChatNest.\n\n` +
        `Config: ${stored.label || 'SMTP config #' + id}\n` +
        `Host: ${config.host}:${config.port} (secure=${config.secure})\n` +
        `From: ${config.from_address || config.smtp_user}\n` +
        `Sent at: ${new Date().toISOString()}\n\n` +
        `If you received this, the SMTP settings are working.`,
    });

    return success(res, {
      ok: true,
      recipient,
      message_id: info?.messageId || null,
      accepted: info?.accepted || [],
      rejected: info?.rejected || [],
      response: info?.response || null,
    }, 'Test email sent');
  } catch (error) {
    // Bubble up SMTP error message so the owner sees the real reason
    // (e.g. "Invalid login", "Connection timeout").
    const wrapped = new Error(error?.message || 'Failed to send test email');
    wrapped.status = error?.status || 502;
    wrapped.details = {
      smtp_code: error?.code || null,
      smtp_response: error?.response || null,
      smtp_responseCode: error?.responseCode || null,
    };
    return next(wrapped);
  }
};

module.exports = {
  getAllSmtpSettings,
  createSmtpSettings,
  updateSmtpSettings,
  activateSmtpSettings,
  deleteSmtpSettings,
  testSmtpSettings,
};
