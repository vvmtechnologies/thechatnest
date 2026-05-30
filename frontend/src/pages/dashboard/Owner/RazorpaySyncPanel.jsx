import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { FiCopy, FiRefreshCw, FiSearch, FiX } from "react-icons/fi";
import { API_BASE_URL } from "../../../config/apiBaseUrl";
import { fetchWithAuth } from "../../../utils/authApi";

// Razorpay Sync — read-only browser over the live Razorpay account.
// Server fetches by date/count, client-side narrows by status/method/
// email/amount so the owner can slice the list without re-hitting the API.

const TABS = [
  { key: "payments", label: "Payments", endpoint: "/billing/razorpay/payments" },
  { key: "orders", label: "Orders", endpoint: "/billing/razorpay/orders" },
  { key: "refunds", label: "Refunds", endpoint: "/billing/razorpay/refunds" },
  { key: "settlements", label: "Settlements", endpoint: "/billing/razorpay/settlements" },
];

const STATUS_TINT = {
  created: "#64748b", authorized: "#0ea5e9", captured: "#22c55e",
  refunded: "#a855f7", failed: "#ef4444", attempted: "#f59e0b",
  paid: "#22c55e", pending: "#f59e0b", processed: "#22c55e",
  cancelled: "#94a3b8",
};

const statusChipSx = (status) => {
  const tint = STATUS_TINT[String(status || "").toLowerCase()] || "#64748b";
  return {
    fontWeight: 700, fontSize: 11, height: 22,
    bgcolor: `${tint}1f`, color: tint,
    border: "1px solid", borderColor: `${tint}55`,
  };
};

const METHOD_LABEL = {
  card: "Card", upi: "UPI", netbanking: "Netbanking",
  wallet: "Wallet", emi: "EMI", paylater: "Pay Later", bank_transfer: "Bank Transfer",
};

const STATUS_OPTIONS_BY_TAB = {
  payments: ["created", "authorized", "captured", "refunded", "failed"],
  orders: ["created", "attempted", "paid"],
  refunds: ["pending", "processed", "failed"],
  settlements: ["created", "processed", "failed"],
};

const METHOD_OPTIONS = ["card", "upi", "netbanking", "wallet", "emi", "paylater", "bank_transfer"];

const fmtMoney = (amountMajor, currency) => {
  const n = Number(amountMajor || 0);
  const sym = { INR: "₹", USD: "$", EUR: "€", GBP: "£" }[String(currency || "INR").toUpperCase()] || "";
  return `${sym}${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const fmtDate = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, {
    year: "numeric", month: "short", day: "2-digit",
    hour: "2-digit", minute: "2-digit",
  });
};

const copyText = (text) => navigator.clipboard?.writeText(String(text || ""));

const RazorpaySyncPanel = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const cardBg = isDark ? "rgba(15,23,42,0.82)" : "#ffffff";
  const cardBorder = isDark ? "rgba(71,85,105,0.45)" : "rgba(148,163,184,0.3)";

  const [tab, setTab] = useState(0);
  const [account, setAccount] = useState(null);
  const [accountErr, setAccountErr] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadErr, setLoadErr] = useState("");

  // Server-side (Razorpay API supports)
  const [count, setCount] = useState(25);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [searchId, setSearchId] = useState("");

  // Client-side filters (narrowed over `rows`)
  const [statusFilter, setStatusFilter] = useState("");
  const [methodFilter, setMethodFilter] = useState("");
  const [emailQuery, setEmailQuery] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");

  // Modals
  const [detailItem, setDetailItem] = useState(null);
  const [refundOpen, setRefundOpen] = useState(null);
  const [refundAmount, setRefundAmount] = useState("");
  const [refundBusy, setRefundBusy] = useState(false);
  const [refundResult, setRefundResult] = useState(null);
  const [refundErr, setRefundErr] = useState("");

  const activeTab = TABS[tab];

  // Header health check on mount.
  useEffect(() => {
    let cancelled = false;
    fetchWithAuth(`${API_BASE_URL}/billing/razorpay/account`)
      .then(({ response, payload }) => {
        if (cancelled) return;
        if (!response.ok) { setAccountErr(payload?.message || "Razorpay not configured"); return; }
        setAccount(payload?.data || null);
      })
      .catch((err) => { if (!cancelled) setAccountErr(err.message || "Razorpay not configured"); });
    return () => { cancelled = true; };
  }, []);

  const loadRows = useCallback(async () => {
    setLoading(true);
    setLoadErr("");
    setRows([]);
    try {
      const params = new URLSearchParams();
      params.set("count", String(count));
      if (from) params.set("from", from);
      if (to) params.set("to", to);
      const { response, payload } = await fetchWithAuth(
        `${API_BASE_URL}${activeTab.endpoint}?${params.toString()}`
      );
      if (!response.ok) throw new Error(payload?.message || "Fetch failed");
      const items = Array.isArray(payload?.data?.items) ? payload.data.items : [];
      setRows(items.map((item) => ({ id: item.id, ...item })));
    } catch (err) {
      setLoadErr(err.message || "Fetch failed");
    } finally {
      setLoading(false);
    }
  }, [activeTab.endpoint, count, from, to]);

  useEffect(() => { loadRows(); }, [loadRows]);

  // Reset client filters when switching tabs so options stay relevant.
  useEffect(() => {
    setStatusFilter(""); setMethodFilter(""); setEmailQuery("");
    setMinAmount(""); setMaxAmount(""); setSearchId("");
  }, [tab]);

  const handleSearch = async () => {
    const id = searchId.trim();
    if (!id) return;
    setLoading(true);
    setLoadErr("");
    setRows([]);
    try {
      if (activeTab.key !== "payments") {
        setLoadErr("Search by ID is only on the Payments tab. Switch tabs or clear the search.");
        return;
      }
      const { response, payload } = await fetchWithAuth(
        `${API_BASE_URL}/billing/razorpay/payments/${encodeURIComponent(id)}`
      );
      if (!response.ok) throw new Error(payload?.message || "Not found");
      const item = payload?.data;
      setRows(item?.id ? [{ id: item.id, ...item }] : []);
    } catch (err) {
      setLoadErr(err.message || "Not found");
    } finally {
      setLoading(false);
    }
  };

  const filteredRows = useMemo(() => {
    const q = emailQuery.trim().toLowerCase();
    const min = minAmount === "" ? null : Number(minAmount);
    const max = maxAmount === "" ? null : Number(maxAmount);
    return rows.filter((row) => {
      if (statusFilter && String(row.status || "").toLowerCase() !== statusFilter) return false;
      if (methodFilter && String(row.method || "").toLowerCase() !== methodFilter) return false;
      if (q) {
        const hay = `${row.email || ""} ${row.contact || ""} ${row.notes?.email || ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      const amt = Number(row.amount_major || 0);
      if (min !== null && Number.isFinite(min) && amt < min) return false;
      if (max !== null && Number.isFinite(max) && amt > max) return false;
      return true;
    });
  }, [rows, statusFilter, methodFilter, emailQuery, minAmount, maxAmount]);

  const submitRefund = async () => {
    if (!refundOpen) return;
    setRefundBusy(true);
    setRefundErr("");
    setRefundResult(null);
    try {
      const body = {};
      const amt = refundAmount.trim();
      if (amt) body.amount = Number(amt);
      const { response, payload } = await fetchWithAuth(
        `${API_BASE_URL}/billing/razorpay/payments/${encodeURIComponent(refundOpen.id)}/refund`,
        { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }
      );
      if (!response.ok) throw new Error(payload?.message || "Refund failed");
      setRefundResult(payload?.data || null);
      loadRows();
    } catch (err) {
      setRefundErr(err.message || "Refund failed");
    } finally {
      setRefundBusy(false);
    }
  };

  const columns = useMemo(() => columnsForTab(activeTab.key, {
    onView: (row) => setDetailItem(row),
    onRefund: (row) => {
      setRefundOpen(row);
      setRefundAmount("");
      setRefundResult(null);
      setRefundErr("");
    },
  }), [activeTab.key]);

  const clientFiltersActive = Boolean(statusFilter || methodFilter || emailQuery || minAmount || maxAmount);
  const statusOptions = STATUS_OPTIONS_BY_TAB[activeTab.key] || [];

  return (
    <Stack spacing={2}>
      {/* Header card */}
      <Paper sx={{ p: 2.2, borderRadius: 2, background: cardBg, border: "1px solid", borderColor: cardBorder }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="h6" fontWeight={800}>Razorpay Sync</Typography>
          {account?.mode && (
            <Chip
              label={account.mode === "live" ? "LIVE" : "TEST"}
              size="small"
              sx={{
                fontWeight: 800, height: 22, fontSize: 11,
                bgcolor: account.mode === "live" ? "rgba(34,197,94,0.18)" : "rgba(245,158,11,0.18)",
                color: account.mode === "live" ? "#15803d" : "#b45309",
              }}
            />
          )}
          {account?.healthy && <Chip label="✓ Healthy" size="small" sx={statusChipSx("captured")} />}
          {account && !account.healthy && <Chip label="✗ API unreachable" size="small" sx={statusChipSx("failed")} />}
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {account?.key_id_prefix
            ? <>Using key <code style={{ fontFamily: "monospace" }}>{account.key_id_prefix}…</code></>
            : "Read-only browser over your Razorpay payments, orders, refunds & settlements."}
        </Typography>
        {accountErr && <Alert severity="warning" sx={{ mt: 1.5 }}>{accountErr}</Alert>}
        {account && !account.healthy && account.last_error && (
          <Alert severity="error" sx={{ mt: 1.5 }}>{account.last_error}</Alert>
        )}
      </Paper>

      {/* Tabs + filters */}
      <Paper sx={{ borderRadius: 2, background: cardBg, border: "1px solid", borderColor: cardBorder, overflow: "hidden" }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{ borderBottom: "1px solid", borderColor: cardBorder, px: 1 }}
        >
          {TABS.map((t) => <Tab key={t.key} label={t.label} sx={{ fontWeight: 700, textTransform: "none" }} />)}
        </Tabs>

        {/* Server-side filters (date range + count + search) */}
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25} sx={{ p: 1.75, pb: 1, flexWrap: "wrap" }}>
          <TextField size="small" type="date" label="From" InputLabelProps={{ shrink: true }}
            value={from} onChange={(e) => setFrom(e.target.value)} sx={{ width: 150 }} />
          <TextField size="small" type="date" label="To" InputLabelProps={{ shrink: true }}
            value={to} onChange={(e) => setTo(e.target.value)} sx={{ width: 150 }} />
          <TextField size="small" select label="Page size" value={count}
            onChange={(e) => setCount(Number(e.target.value) || 25)} sx={{ width: 120 }}>
            {[10, 25, 50, 100].map((n) => <MenuItem key={n} value={n}>{n}</MenuItem>)}
          </TextField>
          {activeTab.key === "payments" && (
            <TextField
              size="small"
              placeholder="Search payment_id (pay_…)"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
              InputProps={{
                startAdornment: <FiSearch style={{ marginRight: 6, color: "#94a3b8" }} />,
                endAdornment: searchId
                  ? <IconButton size="small" onClick={() => { setSearchId(""); loadRows(); }}><FiX size={14} /></IconButton>
                  : null,
              }}
              sx={{ width: 260, "& input": { fontFamily: "monospace" } }}
            />
          )}
          <Box sx={{ flex: 1 }} />
          <Button variant="outlined" size="small" startIcon={<FiRefreshCw />} onClick={loadRows} disabled={loading}>
            {loading ? "Loading…" : "Refresh"}
          </Button>
        </Stack>

        {/* Client-side filters (narrow over fetched rows) */}
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25} sx={{ px: 1.75, pb: 1.5, flexWrap: "wrap", alignItems: "center" }}>
          <TextField size="small" select label="Status" value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)} sx={{ width: 150 }}>
            <MenuItem value="">All</MenuItem>
            {statusOptions.map((s) => (
              <MenuItem key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </MenuItem>
            ))}
          </TextField>
          {activeTab.key === "payments" && (
            <TextField size="small" select label="Method" value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)} sx={{ width: 150 }}>
              <MenuItem value="">All</MenuItem>
              {METHOD_OPTIONS.map((m) => (
                <MenuItem key={m} value={m}>{METHOD_LABEL[m] || m}</MenuItem>
              ))}
            </TextField>
          )}
          {(activeTab.key === "payments" || activeTab.key === "orders") && (
            <TextField size="small" placeholder="Search email / phone"
              value={emailQuery} onChange={(e) => setEmailQuery(e.target.value)}
              InputProps={{ startAdornment: <FiSearch style={{ marginRight: 6, color: "#94a3b8" }} /> }}
              sx={{ width: 220 }} />
          )}
          <TextField size="small" type="number" label="Min amount" value={minAmount}
            onChange={(e) => setMinAmount(e.target.value)} sx={{ width: 130 }} />
          <TextField size="small" type="number" label="Max amount" value={maxAmount}
            onChange={(e) => setMaxAmount(e.target.value)} sx={{ width: 130 }} />
          {clientFiltersActive && (
            <Button size="small" onClick={() => {
              setStatusFilter(""); setMethodFilter(""); setEmailQuery("");
              setMinAmount(""); setMaxAmount("");
            }}>
              Clear filters
            </Button>
          )}
          <Box sx={{ flex: 1 }} />
          <Chip label={`${filteredRows.length} of ${rows.length} shown`} size="small" sx={{ fontWeight: 700 }} />
        </Stack>

        {loadErr && <Alert severity="error" sx={{ mx: 2, mb: 2 }}>{loadErr}</Alert>}

        <Box sx={{ height: 560, px: 1.5, pb: 1.5 }}>
          {loading && rows.length === 0 ? (
            <Stack alignItems="center" justifyContent="center" sx={{ height: "100%" }}>
              <CircularProgress />
            </Stack>
          ) : (
            <DataGrid
              rows={filteredRows}
              columns={columns}
              loading={loading}
              disableRowSelectionOnClick
              hideFooterSelectedRowCount
              pageSizeOptions={[25, 50, 100]}
              initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
              onRowClick={(params) => setDetailItem(params.row)}
              sx={{
                border: 0,
                "& .MuiDataGrid-cell": { fontSize: 13 },
                "& .MuiDataGrid-columnHeaders": { bgcolor: isDark ? "rgba(30,41,59,0.6)" : "rgba(241,245,249,0.8)" },
                "& .MuiDataGrid-row": { cursor: "pointer" },
              }}
            />
          )}
        </Box>
      </Paper>

      {/* Detail dialog — proper structured UI per tab */}
      <Dialog
        open={Boolean(detailItem)}
        onClose={() => setDetailItem(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { background: cardBg, border: "1px solid", borderColor: cardBorder } }}
      >
        {detailItem && (
          <DetailDialogContent
            item={detailItem}
            tabKey={activeTab.key}
            onClose={() => setDetailItem(null)}
            onRefund={() => {
              setRefundOpen(detailItem);
              setRefundAmount("");
              setRefundResult(null);
              setRefundErr("");
              setDetailItem(null);
            }}
          />
        )}
      </Dialog>

      {/* Refund dialog */}
      <Dialog open={Boolean(refundOpen)} onClose={() => !refundBusy && setRefundOpen(null)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { background: cardBg, border: "1px solid", borderColor: cardBorder } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Refund payment</DialogTitle>
        <DialogContent dividers>
          {refundOpen && (
            <Stack spacing={1.5}>
              <Typography variant="body2">
                Payment <code>{refundOpen.id}</code> · captured {fmtMoney(refundOpen.amount_major, refundOpen.currency)}
              </Typography>
              <TextField size="small"
                label={`Amount to refund (max ${fmtMoney(refundOpen.amount_major, refundOpen.currency)})`}
                placeholder="Blank = full refund"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value.replace(/[^0-9.]/g, ""))}
                helperText="Amount in major units (rupees). Leave blank for full refund."
                disabled={refundBusy}
              />
              {refundErr && <Alert severity="error">{refundErr}</Alert>}
              {refundResult && <Alert severity="success">Refund <code>{refundResult.id}</code> · status: {refundResult.status}</Alert>}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRefundOpen(null)} disabled={refundBusy}>Cancel</Button>
          <Button variant="contained" color="warning" onClick={submitRefund} disabled={refundBusy || Boolean(refundResult)}>
            {refundBusy ? "Refunding…" : refundResult ? "Refunded" : "Confirm refund"}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

// ─── Detail dialog ───────────────────────────────────────────────────
const Row = ({ label, value, mono = false, copy = false }) => {
  const isEmpty = value === null || value === undefined || value === "";
  return (
    <Grid item xs={12} sm={6}>
      <Box sx={{ py: 0.5 }}>
        <Typography variant="caption" sx={{ fontWeight: 800, color: "text.secondary", letterSpacing: 0.4, textTransform: "uppercase", fontSize: 10 }}>
          {label}
        </Typography>
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <Typography sx={{
            fontWeight: 600, fontSize: 13.5, mt: 0.25, wordBreak: "break-word",
            fontFamily: mono ? "monospace" : "inherit",
            color: isEmpty ? "text.disabled" : "text.primary",
          }}>
            {isEmpty ? "—" : String(value)}
          </Typography>
          {!isEmpty && copy && (
            <Tooltip title="Copy">
              <IconButton size="small" onClick={() => copyText(value)} sx={{ p: 0.25 }}>
                <FiCopy size={12} />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      </Box>
    </Grid>
  );
};

const Section = ({ title, children }) => (
  <Box sx={{ mb: 2 }}>
    <Typography variant="overline" sx={{ fontWeight: 800, letterSpacing: 1, color: "text.secondary" }}>
      {title}
    </Typography>
    <Box sx={(theme) => ({
      mt: 0.5, p: 1.5, borderRadius: 1.5,
      border: `1px solid ${theme.palette.divider}`,
      bgcolor: theme.palette.mode === "light" ? "#fafbff" : "rgba(255,255,255,0.02)",
    })}>
      <Grid container spacing={1}>{children}</Grid>
    </Box>
  </Box>
);

const DetailDialogContent = ({ item, tabKey, onClose, onRefund }) => {
  const isPayment = tabKey === "payments";
  const isOrder = tabKey === "orders";
  const isRefund = tabKey === "refunds";
  const isSettlement = tabKey === "settlements";
  const canRefund = isPayment && String(item.status || "").toLowerCase() === "captured" && !item.amount_refunded;
  const titles = {
    payments: "Payment details",
    orders: "Order details",
    refunds: "Refund details",
    settlements: "Settlement details",
  };

  return (
    <>
      <DialogTitle sx={{ fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "space-between", pr: 1 }}>
        <Stack direction="row" alignItems="center" spacing={1.25}>
          <span>{titles[tabKey] || "Details"}</span>
          <Chip label={String(item.status || "—")} size="small" sx={statusChipSx(item.status)} />
        </Stack>
        <IconButton size="small" onClick={onClose}><FiX /></IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {/* Hero amount strip */}
        <Box sx={{
          p: 2, mb: 2, borderRadius: 2, textAlign: "center",
          background: "linear-gradient(135deg, #0b0f1e, #1a1f3a)",
          color: "#fff",
        }}>
          <Typography variant="overline" sx={{ color: "rgba(255,213,74,0.85)", letterSpacing: 1.5, fontWeight: 800 }}>
            {isPayment ? "Amount" : isOrder ? "Order amount" : isRefund ? "Refund amount" : "Settlement amount"}
          </Typography>
          <Typography sx={{ fontSize: 36, fontWeight: 900, mt: 0.25 }}>
            {fmtMoney(item.amount_major, item.currency)}
          </Typography>
          <Typography sx={{ opacity: 0.75, fontSize: 13 }}>
            {String(item.id || "")}
          </Typography>
        </Box>

        {isPayment && (
          <>
            <Section title="Customer">
              <Row label="Email" value={item.email} copy />
              <Row label="Contact" value={item.contact} copy />
              <Row label="Name (notes)" value={item.notes?.plan_name || item.notes?.name} />
              <Row label="VPA" value={item.vpa} mono />
            </Section>

            <Section title="Payment method">
              <Row label="Method" value={METHOD_LABEL[item.method] || item.method} />
              <Row label="Bank" value={item.bank} />
              <Row label="Wallet" value={item.wallet} />
              <Row label="Card last 4" value={item.card?.last4} mono />
              <Row label="Card network" value={item.card?.network} />
              <Row label="Card type" value={item.card?.type} />
              <Row label="Card issuer" value={item.card?.issuer} />
              <Row label="International" value={item.international ? "Yes" : "No"} />
            </Section>

            <Section title="Order & description">
              <Row label="Order ID" value={item.order_id} mono copy />
              <Row label="Receipt" value={item.notes?.plan_name} />
              <Row label="Description" value={item.description} />
              <Row label="Plan" value={item.notes?.plan_name} />
              <Row label="Users" value={item.notes?.user_count} />
              <Row label="Cycle" value={item.notes?.cycle} />
              <Row label="Billing type" value={item.notes?.billing_type} />
            </Section>

            <Section title="Fees & taxes">
              <Row label="Captured" value={item.captured ? "Yes" : "No"} />
              <Row label="Razorpay fee" value={item.fee_major ? fmtMoney(item.fee_major, item.currency) : "—"} />
              <Row label="GST / Tax" value={item.tax_major ? fmtMoney(item.tax_major, item.currency) : "—"} />
              <Row label="Refunded" value={item.amount_refunded ? fmtMoney(item.amount_refunded / 100, item.currency) : "—"} />
            </Section>

            {String(item.status || "").toLowerCase() === "failed" && (
              <Section title="Failure">
                <Row label="Error code" value={item.error_code} mono />
                <Row label="Error reason" value={item.error_reason} />
                <Row label="Source" value={item.error_source} />
                <Row label="Step" value={item.error_step} />
                <Grid item xs={12}>
                  <Box sx={{ py: 0.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: "text.secondary", letterSpacing: 0.4, textTransform: "uppercase", fontSize: 10 }}>
                      Description
                    </Typography>
                    <Typography sx={{ fontWeight: 600, fontSize: 13.5, mt: 0.25, color: "#dc2626" }}>
                      {item.error_description || "—"}
                    </Typography>
                  </Box>
                </Grid>
              </Section>
            )}

            <Section title="Timeline">
              <Row label="Created" value={fmtDate(item.created_at_iso)} />
              <Row label="Authorized" value={fmtDate(item.authorized_at_iso)} />
              <Row label="Captured" value={fmtDate(item.captured_at_iso)} />
            </Section>
          </>
        )}

        {isOrder && (
          <>
            <Section title="Order">
              <Row label="Order ID" value={item.id} mono copy />
              <Row label="Receipt" value={item.receipt} mono copy />
              <Row label="Status" value={item.status} />
              <Row label="Attempts" value={item.attempts} />
              <Row label="Amount paid" value={fmtMoney(item.amount_paid_major, item.currency)} />
              <Row label="Amount due" value={fmtMoney((Number(item.amount_due || 0)) / 100, item.currency)} />
            </Section>
            <Section title="Notes">
              {Object.entries(item.notes || {}).map(([k, v]) => (
                <Row key={k} label={k.replace(/_/g, " ")} value={v} />
              ))}
              {!item.notes || !Object.keys(item.notes).length ? (
                <Grid item xs={12}><Typography variant="caption" color="text.disabled">No notes attached</Typography></Grid>
              ) : null}
            </Section>
            <Section title="Timeline">
              <Row label="Created" value={fmtDate(item.created_at_iso)} />
            </Section>
          </>
        )}

        {isRefund && (
          <>
            <Section title="Refund">
              <Row label="Refund ID" value={item.id} mono copy />
              <Row label="Payment ID" value={item.payment_id} mono copy />
              <Row label="Status" value={item.status} />
              <Row label="Speed requested" value={item.speed_requested} />
              <Row label="Speed processed" value={item.speed_processed} />
              <Row label="Batch ID" value={item.batch_id} mono />
              <Row label="ARN (bank reference)" value={item.acquirer_data?.arn} mono />
            </Section>
            <Section title="Notes">
              {Object.entries(item.notes || {}).map(([k, v]) => (
                <Row key={k} label={k.replace(/_/g, " ")} value={v} />
              ))}
              {!item.notes || !Object.keys(item.notes).length ? (
                <Grid item xs={12}><Typography variant="caption" color="text.disabled">No notes</Typography></Grid>
              ) : null}
            </Section>
            <Section title="Timeline">
              <Row label="Created" value={fmtDate(item.created_at_iso)} />
            </Section>
          </>
        )}

        {isSettlement && (
          <>
            <Section title="Settlement">
              <Row label="Settlement ID" value={item.id} mono copy />
              <Row label="Status" value={item.status} />
              <Row label="Bank UTR" value={item.utr} mono copy />
              <Row label="Amount" value={fmtMoney(item.amount_major, item.currency)} />
              <Row label="Fees" value={item.fees ? fmtMoney(Number(item.fees) / 100, item.currency) : "—"} />
              <Row label="Tax" value={item.tax ? fmtMoney(Number(item.tax) / 100, item.currency) : "—"} />
            </Section>
            <Section title="Timeline">
              <Row label="Created" value={fmtDate(item.created_at_iso)} />
            </Section>
          </>
        )}

        {/* Always offer raw JSON as a fallback for power users */}
        <Box sx={{ mt: 1 }}>
          <Typography variant="caption" sx={{ fontWeight: 800, color: "text.secondary", letterSpacing: 0.4, textTransform: "uppercase" }}>
            Raw JSON
          </Typography>
          <Box sx={(theme) => ({
            mt: 0.5, p: 1.25, borderRadius: 1, maxHeight: 220, overflow: "auto",
            border: `1px solid ${theme.palette.divider}`,
            bgcolor: theme.palette.mode === "light" ? "#f1f5f9" : "rgba(255,255,255,0.04)",
            fontFamily: "monospace", fontSize: 11, whiteSpace: "pre-wrap", wordBreak: "break-word",
          })}>
            {JSON.stringify(item, null, 2)}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        {canRefund && (
          <Button color="warning" onClick={onRefund}>Refund this payment</Button>
        )}
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </>
  );
};

// ─── DataGrid columns per tab ────────────────────────────────────────
const columnsForTab = (tabKey, { onView, onRefund }) => {
  const base = {
    payments: [
      { field: "id", headerName: "Payment ID", flex: 1, minWidth: 200,
        renderCell: (p) => <Box sx={{ fontFamily: "monospace", fontSize: 12 }}>{p.value}</Box> },
      { field: "status", headerName: "Status", width: 110,
        renderCell: (p) => <Chip label={String(p.value || "")} size="small" sx={statusChipSx(p.value)} /> },
      { field: "amount_major", headerName: "Amount", width: 120,
        renderCell: (p) => <Box sx={{ fontWeight: 700 }}>{fmtMoney(p.value, p.row.currency)}</Box> },
      { field: "method", headerName: "Method", width: 110,
        renderCell: (p) => METHOD_LABEL[p.value] || p.value || "—" },
      { field: "email", headerName: "Email", flex: 1, minWidth: 180 },
      { field: "contact", headerName: "Contact", width: 130 },
      { field: "created_at_iso", headerName: "Created", width: 160, renderCell: (p) => fmtDate(p.value) },
      { field: "_actions", headerName: "", width: 180, sortable: false, filterable: false,
        renderCell: (p) => (
          <Stack direction="row" spacing={0.5}>
            <Button size="small" variant="outlined" onClick={(e) => { e.stopPropagation(); onView(p.row); }}>View</Button>
            {String(p.row.status || "").toLowerCase() === "captured" && !p.row.amount_refunded && (
              <Button size="small" variant="outlined" color="warning"
                onClick={(e) => { e.stopPropagation(); onRefund(p.row); }}>Refund</Button>
            )}
          </Stack>
        ) },
    ],
    orders: [
      { field: "id", headerName: "Order ID", flex: 1, minWidth: 200,
        renderCell: (p) => <Box sx={{ fontFamily: "monospace", fontSize: 12 }}>{p.value}</Box> },
      { field: "status", headerName: "Status", width: 110,
        renderCell: (p) => <Chip label={String(p.value || "")} size="small" sx={statusChipSx(p.value)} /> },
      { field: "amount_major", headerName: "Amount", width: 110,
        renderCell: (p) => <Box sx={{ fontWeight: 700 }}>{fmtMoney(p.value, p.row.currency)}</Box> },
      { field: "amount_paid_major", headerName: "Paid", width: 100,
        renderCell: (p) => fmtMoney(p.value, p.row.currency) },
      { field: "receipt", headerName: "Receipt", flex: 1, minWidth: 160 },
      { field: "attempts", headerName: "Attempts", width: 90 },
      { field: "created_at_iso", headerName: "Created", width: 160, renderCell: (p) => fmtDate(p.value) },
    ],
    refunds: [
      { field: "id", headerName: "Refund ID", flex: 1, minWidth: 200,
        renderCell: (p) => <Box sx={{ fontFamily: "monospace", fontSize: 12 }}>{p.value}</Box> },
      { field: "payment_id", headerName: "Payment ID", flex: 1, minWidth: 180,
        renderCell: (p) => <Box sx={{ fontFamily: "monospace", fontSize: 12 }}>{p.value}</Box> },
      { field: "status", headerName: "Status", width: 110,
        renderCell: (p) => <Chip label={String(p.value || "")} size="small" sx={statusChipSx(p.value)} /> },
      { field: "amount_major", headerName: "Amount", width: 110,
        renderCell: (p) => <Box sx={{ fontWeight: 700 }}>{fmtMoney(p.value, p.row.currency)}</Box> },
      { field: "speed_requested", headerName: "Speed", width: 100 },
      { field: "created_at_iso", headerName: "Created", width: 160, renderCell: (p) => fmtDate(p.value) },
    ],
    settlements: [
      { field: "id", headerName: "Settlement ID", flex: 1, minWidth: 200,
        renderCell: (p) => <Box sx={{ fontFamily: "monospace", fontSize: 12 }}>{p.value}</Box> },
      { field: "status", headerName: "Status", width: 110,
        renderCell: (p) => <Chip label={String(p.value || "")} size="small" sx={statusChipSx(p.value)} /> },
      { field: "amount_major", headerName: "Amount", width: 120,
        renderCell: (p) => <Box sx={{ fontWeight: 700 }}>{fmtMoney(p.value, p.row.currency)}</Box> },
      { field: "fees", headerName: "Fees", width: 90,
        renderCell: (p) => (p.value ? fmtMoney(Number(p.value) / 100, p.row.currency) : "—") },
      { field: "tax", headerName: "Tax", width: 90,
        renderCell: (p) => (p.value ? fmtMoney(Number(p.value) / 100, p.row.currency) : "—") },
      { field: "utr", headerName: "Bank UTR", flex: 1, minWidth: 160 },
      { field: "created_at_iso", headerName: "Created", width: 160, renderCell: (p) => fmtDate(p.value) },
    ],
  };
  return base[tabKey] || base.payments;
};

export default RazorpaySyncPanel;
