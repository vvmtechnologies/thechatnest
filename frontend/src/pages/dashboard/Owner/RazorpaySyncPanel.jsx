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
  IconButton,
  MenuItem,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { FiRefreshCw, FiSearch, FiX } from "react-icons/fi";
import { API_BASE_URL } from "../../../config/apiBaseUrl";
import { fetchWithAuth } from "../../../utils/authApi";

// Razorpay Sync — read-only browser over the live Razorpay account.
// Tabs: Payments / Orders / Refunds / Settlements. Each backed by a
// thin /billing/razorpay/* endpoint. Header shows account health +
// active mode badge so the owner knows which key set is in play.

const TABS = [
  { key: "payments", label: "Payments", endpoint: "/billing/razorpay/payments" },
  { key: "orders", label: "Orders", endpoint: "/billing/razorpay/orders" },
  { key: "refunds", label: "Refunds", endpoint: "/billing/razorpay/refunds" },
  { key: "settlements", label: "Settlements", endpoint: "/billing/razorpay/settlements" },
];

const STATUS_TINT = {
  // Payments
  created: "#64748b",
  authorized: "#0ea5e9",
  captured: "#22c55e",
  refunded: "#a855f7",
  failed: "#ef4444",
  // Orders
  attempted: "#f59e0b",
  paid: "#22c55e",
  // Refunds
  pending: "#f59e0b",
  processed: "#22c55e",
  // Settlements
  created_set: "#64748b",
  processed_set: "#22c55e",
};

const statusChipSx = (status) => {
  const tint = STATUS_TINT[String(status || "").toLowerCase()] || "#64748b";
  return {
    fontWeight: 700,
    fontSize: 11,
    height: 22,
    bgcolor: `${tint}1f`,
    color: tint,
    border: "1px solid",
    borderColor: `${tint}55`,
  };
};

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
  const [count, setCount] = useState(25);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [searchId, setSearchId] = useState("");
  const [detailItem, setDetailItem] = useState(null);
  const [refundOpen, setRefundOpen] = useState(null); // payment object
  const [refundAmount, setRefundAmount] = useState("");
  const [refundBusy, setRefundBusy] = useState(false);
  const [refundResult, setRefundResult] = useState(null);
  const [refundErr, setRefundErr] = useState("");

  const activeTab = TABS[tab];

  // Load the account summary once on mount so the header chip says
  // "test / live" + healthy or not without the user clicking anything.
  useEffect(() => {
    let cancelled = false;
    fetchWithAuth(`${API_BASE_URL}/billing/razorpay/account`)
      .then(({ response, payload }) => {
        if (cancelled) return;
        if (!response.ok) {
          setAccountErr(payload?.message || "Razorpay not configured");
          return;
        }
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

  // Refetch when tab / filter change.
  useEffect(() => { loadRows(); }, [loadRows]);

  // Search by ID — bypasses the listing endpoint, fetches a single record.
  const handleSearch = async () => {
    const id = searchId.trim();
    if (!id) return;
    setLoading(true);
    setLoadErr("");
    setRows([]);
    try {
      const endpoint = activeTab.key === "payments"
        ? `${API_BASE_URL}/billing/razorpay/payments/${encodeURIComponent(id)}`
        : null;
      if (!endpoint) {
        setLoadErr(`Search by ID only supported on the Payments tab right now. Switch tabs or clear the search.`);
        return;
      }
      const { response, payload } = await fetchWithAuth(endpoint);
      if (!response.ok) throw new Error(payload?.message || "Not found");
      const item = payload?.data;
      setRows(item?.id ? [{ id: item.id, ...item }] : []);
    } catch (err) {
      setLoadErr(err.message || "Not found");
    } finally {
      setLoading(false);
    }
  };

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
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );
      if (!response.ok) throw new Error(payload?.message || "Refund failed");
      setRefundResult(payload?.data || null);
      // Refresh listing so the payment shows the new refunded amount.
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

  return (
    <Stack spacing={2}>
      {/* Header card */}
      <Paper sx={{ p: 2.2, borderRadius: 2, background: cardBg, border: "1px solid", borderColor: cardBorder }}>
        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} spacing={1.5}>
          <Stack spacing={0.4}>
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
            <Typography variant="body2" color="text.secondary">
              {account?.key_id_prefix
                ? <>Using key <code style={{ fontFamily: "monospace" }}>{account.key_id_prefix}…</code></>
                : "Read-only browser over your Razorpay payments, orders, refunds & settlements."}
            </Typography>
          </Stack>
        </Stack>
        {accountErr && <Alert severity="warning" sx={{ mt: 1.5 }}>{accountErr}</Alert>}
        {account && !account.healthy && account.last_error && (
          <Alert severity="error" sx={{ mt: 1.5 }}>{account.last_error}</Alert>
        )}
      </Paper>

      {/* Tabs + filters */}
      <Paper sx={{ borderRadius: 2, background: cardBg, border: "1px solid", borderColor: cardBorder, overflow: "hidden" }}>
        <Tabs
          value={tab}
          onChange={(_, v) => { setTab(v); setSearchId(""); }}
          sx={{ borderBottom: "1px solid", borderColor: cardBorder, px: 1 }}
        >
          {TABS.map((t) => <Tab key={t.key} label={t.label} sx={{ fontWeight: 700, textTransform: "none" }} />)}
        </Tabs>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25} sx={{ p: 1.75, flexWrap: "wrap" }}>
          <TextField
            size="small"
            type="date"
            label="From"
            InputLabelProps={{ shrink: true }}
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            sx={{ width: 150 }}
          />
          <TextField
            size="small"
            type="date"
            label="To"
            InputLabelProps={{ shrink: true }}
            value={to}
            onChange={(e) => setTo(e.target.value)}
            sx={{ width: 150 }}
          />
          <TextField
            size="small"
            select
            label="Page size"
            value={count}
            onChange={(e) => setCount(Number(e.target.value) || 25)}
            sx={{ width: 130 }}
          >
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
              sx={{ width: 260, fontFamily: "monospace" }}
            />
          )}
          <Box sx={{ flex: 1 }} />
          <Button
            variant="outlined"
            size="small"
            startIcon={<FiRefreshCw />}
            onClick={loadRows}
            disabled={loading}
          >
            {loading ? "Loading…" : "Refresh"}
          </Button>
        </Stack>

        {loadErr && <Alert severity="error" sx={{ mx: 2, mb: 2 }}>{loadErr}</Alert>}

        <Box sx={{ height: 560, px: 1.5, pb: 1.5 }}>
          {loading && rows.length === 0 ? (
            <Stack alignItems="center" justifyContent="center" sx={{ height: "100%" }}>
              <CircularProgress />
            </Stack>
          ) : (
            <DataGrid
              rows={rows}
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

      {/* Detail dialog */}
      <Dialog open={Boolean(detailItem)} onClose={() => setDetailItem(null)} maxWidth="md" fullWidth
        PaperProps={{ sx: { background: cardBg, border: "1px solid", borderColor: cardBorder } }}>
        <DialogTitle sx={{ fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span>{activeTab.label.slice(0, -1)} details</span>
          <IconButton size="small" onClick={() => setDetailItem(null)}><FiX /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {detailItem && (
            <Box sx={{ fontFamily: "monospace", fontSize: 12, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
              {JSON.stringify(detailItem, null, 2)}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          {detailItem && activeTab.key === "payments" && String(detailItem.status || "").toLowerCase() === "captured" && (
            <Button
              color="warning"
              onClick={() => {
                setRefundOpen(detailItem);
                setRefundAmount("");
                setRefundResult(null);
                setRefundErr("");
                setDetailItem(null);
              }}
            >
              Refund this payment
            </Button>
          )}
          <Button onClick={() => setDetailItem(null)}>Close</Button>
        </DialogActions>
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
              <TextField
                size="small"
                label={`Amount to refund (max ${fmtMoney(refundOpen.amount_major, refundOpen.currency)})`}
                placeholder="Blank = full refund"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value.replace(/[^0-9.]/g, ""))}
                helperText="Enter amount in major units (rupees). Leave blank to refund the full captured amount."
                disabled={refundBusy}
              />
              {refundErr && <Alert severity="error">{refundErr}</Alert>}
              {refundResult && <Alert severity="success">Refund <code>{refundResult.id}</code> · status: {refundResult.status}</Alert>}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRefundOpen(null)} disabled={refundBusy}>Cancel</Button>
          <Button
            variant="contained"
            color="warning"
            onClick={submitRefund}
            disabled={refundBusy || Boolean(refundResult)}
          >
            {refundBusy ? "Refunding…" : refundResult ? "Refunded" : "Confirm refund"}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

// Per-tab column definitions. Each tab has different shape; share what's
// universal (id, status, amount, created_at) and add tab-specific fields.
const columnsForTab = (tabKey, { onView, onRefund }) => {
  const base = {
    payments: [
      { field: "id", headerName: "Payment ID", flex: 1, minWidth: 200,
        renderCell: (p) => <Box sx={{ fontFamily: "monospace", fontSize: 12 }}>{p.value}</Box> },
      { field: "status", headerName: "Status", width: 110,
        renderCell: (p) => <Chip label={String(p.value || "")} size="small" sx={statusChipSx(p.value)} /> },
      { field: "amount_major", headerName: "Amount", width: 110,
        renderCell: (p) => <Box sx={{ fontWeight: 700 }}>{fmtMoney(p.value, p.row.currency)}</Box> },
      { field: "method", headerName: "Method", width: 100 },
      { field: "email", headerName: "Email", flex: 1, minWidth: 180 },
      { field: "contact", headerName: "Contact", width: 130 },
      { field: "created_at_iso", headerName: "Created", width: 160,
        renderCell: (p) => fmtDate(p.value) },
      { field: "_actions", headerName: "", width: 180, sortable: false, filterable: false,
        renderCell: (p) => (
          <Stack direction="row" spacing={0.5}>
            <Button size="small" variant="outlined" onClick={(e) => { e.stopPropagation(); onView(p.row); }}>View</Button>
            {String(p.row.status || "").toLowerCase() === "captured" && (
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
