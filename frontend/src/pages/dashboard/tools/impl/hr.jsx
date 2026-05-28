import { useMemo, useState } from "react";
import { Alert, Box, Chip, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { ToolSection, monoFont } from "./ToolShell.jsx";

// ─────────────────────────────────────────────────────────────────────
// Working Days Calculator — counts business days between two dates,
// skipping weekends and an optional list of holiday dates.
// ─────────────────────────────────────────────────────────────────────
export function WorkingDays() {
  const today = new Date();
  const in30 = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
  const toInput = (d) => d.toISOString().slice(0, 10);

  const [start, setStart] = useState(toInput(today));
  const [end, setEnd] = useState(toInput(in30));
  const [skipSat, setSkipSat] = useState(true);
  const [skipSun, setSkipSun] = useState(true);
  const [holidays, setHolidays] = useState("");

  const result = useMemo(() => {
    const s = new Date(start);
    const e = new Date(end);
    if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return null;
    if (s > e) return { error: "End date is before start date." };
    const skipDays = new Set();
    if (skipSat) skipDays.add(6);
    if (skipSun) skipDays.add(0);
    const holidaySet = new Set(
      holidays.split(/[\n,]/).map((s2) => s2.trim()).filter(Boolean).map((d) => new Date(d).toISOString().slice(0, 10))
    );
    let total = 0, working = 0, weekend = 0, holiday = 0;
    const cur = new Date(s);
    while (cur <= e) {
      total += 1;
      const iso = cur.toISOString().slice(0, 10);
      if (holidaySet.has(iso)) holiday += 1;
      else if (skipDays.has(cur.getDay())) weekend += 1;
      else working += 1;
      cur.setDate(cur.getDate() + 1);
    }
    return { total, working, weekend, holiday };
  }, [start, end, skipSat, skipSun, holidays]);

  return (
    <>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mb: 2 }}>
        <TextField fullWidth size="small" type="date" label="Start" InputLabelProps={{ shrink: true }} value={start} onChange={(e) => setStart(e.target.value)} />
        <TextField fullWidth size="small" type="date" label="End" InputLabelProps={{ shrink: true }} value={end} onChange={(e) => setEnd(e.target.value)} />
      </Stack>
      <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: "wrap" }}>
        <Chip label="Skip Saturdays" onClick={() => setSkipSat((v) => !v)} color={skipSat ? "primary" : "default"} variant={skipSat ? "filled" : "outlined"} sx={{ cursor: "pointer" }} />
        <Chip label="Skip Sundays" onClick={() => setSkipSun((v) => !v)} color={skipSun ? "primary" : "default"} variant={skipSun ? "filled" : "outlined"} sx={{ cursor: "pointer" }} />
      </Stack>
      <TextField
        fullWidth size="small" multiline minRows={2} sx={{ mb: 2 }}
        label="Holidays (optional)"
        placeholder="One date per line, e.g. 2026-08-15"
        value={holidays} onChange={(e) => setHolidays(e.target.value)}
        InputProps={{ sx: { fontFamily: monoFont, fontSize: 13 } }}
      />

      {result?.error ? (
        <Alert severity="error">{result.error}</Alert>
      ) : result ? (
        <>
          <Box sx={{ p: 3, borderRadius: 2, background: "linear-gradient(135deg, #0b0f1e, #1a1f3a)", color: "#fff", textAlign: "center", mb: 2 }}>
            <Typography variant="overline" sx={{ color: "rgba(255,213,74,0.85)", letterSpacing: 1.5, fontWeight: 800 }}>Working days</Typography>
            <Typography sx={{ fontSize: 56, fontWeight: 900, mt: 0.25 }}>{result.working}</Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.7)", fontSize: 13 }}>out of {result.total} calendar days</Typography>
          </Box>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr" }, gap: 1.25 }}>
            <Stat label="Total" value={result.total} />
            <Stat label="Weekend" value={result.weekend} />
            <Stat label="Holiday" value={result.holiday} />
          </Box>
        </>
      ) : null}
    </>
  );
}

const Stat = ({ label, value, hint }) => (
  <Box sx={(theme) => ({ p: 2, borderRadius: 1.5, border: `1px solid ${theme.palette.divider}`, bgcolor: "background.paper", textAlign: "center" })}>
    <Typography variant="caption" sx={{ fontWeight: 800, color: "text.secondary", letterSpacing: 0.4, textTransform: "uppercase", fontSize: 10 }}>{label}</Typography>
    <Typography sx={{ fontSize: 22, fontWeight: 800, mt: 0.25 }}>{value}</Typography>
    {hint && <Typography variant="caption" color="text.disabled" sx={{ display: "block" }}>{hint}</Typography>}
  </Box>
);

// ─────────────────────────────────────────────────────────────────────
// Vacation Day Tracker — accrual + used → remaining balance
// ─────────────────────────────────────────────────────────────────────
export function VacationTracker() {
  const today = new Date();
  const jan1 = new Date(today.getFullYear(), 0, 1);
  const [annual, setAnnual] = useState(24);
  const [carryOver, setCarryOver] = useState(0);
  const [used, setUsed] = useState(8);
  const [pending, setPending] = useState(2);
  const [startOfYear, setStartOfYear] = useState(jan1.toISOString().slice(0, 10));

  const days = useMemo(() => {
    const start = new Date(startOfYear);
    const now = new Date();
    if (Number.isNaN(start.getTime()) || now < start) return null;
    const yearMs = 365.25 * 24 * 60 * 60 * 1000;
    const elapsedFraction = Math.max(0, Math.min(1, (now - start) / yearMs));
    const accrued = annual * elapsedFraction;
    const total = accrued + carryOver;
    const remaining = total - used - pending;
    return { accrued, total, remaining, elapsedFraction };
  }, [annual, carryOver, used, pending, startOfYear]);

  return (
    <>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(5, 1fr)" }, gap: 1.5, mb: 2 }}>
        <TextField label="Annual PTO" type="number" size="small" value={annual} onChange={(e) => setAnnual(Math.max(0, Number(e.target.value) || 0))} />
        <TextField label="Carry-over" type="number" size="small" value={carryOver} onChange={(e) => setCarryOver(Math.max(0, Number(e.target.value) || 0))} />
        <TextField label="Used" type="number" size="small" value={used} onChange={(e) => setUsed(Math.max(0, Number(e.target.value) || 0))} />
        <TextField label="Pending requests" type="number" size="small" value={pending} onChange={(e) => setPending(Math.max(0, Number(e.target.value) || 0))} />
        <TextField label="Year starts" type="date" size="small" InputLabelProps={{ shrink: true }} value={startOfYear} onChange={(e) => setStartOfYear(e.target.value)} />
      </Box>

      {days && (
        <>
          <Box sx={{ p: 3, borderRadius: 2, background: days.remaining < 5 ? "linear-gradient(135deg, #b91c1c, #f59e0b)" : "linear-gradient(135deg, #0b0f1e, #1a1f3a)", color: "#fff", textAlign: "center", mb: 2 }}>
            <Typography variant="overline" sx={{ letterSpacing: 1.5, fontWeight: 800 }}>Available now</Typography>
            <Typography sx={{ fontSize: 56, fontWeight: 900, mt: 0.25 }}>{days.remaining.toFixed(1)} days</Typography>
            <Typography sx={{ opacity: 0.75, fontSize: 13 }}>{Math.round(days.elapsedFraction * 100)}% of the year elapsed</Typography>
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(4, 1fr)" }, gap: 1.25 }}>
            <Stat label="Annual" value={annual} />
            <Stat label="Accrued" value={days.accrued.toFixed(1)} hint="so far this year" />
            <Stat label="Available" value={days.total.toFixed(1)} hint="accrued + carry-over" />
            <Stat label="Committed" value={used + pending} hint={`${used} used + ${pending} pending`} />
          </Box>

          {days.remaining < 0 && (
            <Alert severity="warning" sx={{ mt: 2 }}>You've committed more days than you've accrued. Pending requests may not get approved.</Alert>
          )}
        </>
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Salary → Hourly Converter — annual / monthly / weekly / hourly,
// honors hours/week + weeks of paid leave.
// ─────────────────────────────────────────────────────────────────────
export function SalaryToHourly() {
  const [annual, setAnnual] = useState(1200000);
  const [currency, setCurrency] = useState("INR");
  const [hoursPerWeek, setHoursPerWeek] = useState(40);
  const [vacationWeeks, setVacationWeeks] = useState(4);
  const symbols = { INR: "₹", USD: "$", EUR: "€", GBP: "£" };

  const workWeeks = Math.max(1, 52 - vacationWeeks);
  const annualHours = workWeeks * hoursPerWeek;
  const hourly = annual / annualHours;
  const weekly = annual / 52;
  const monthly = annual / 12;
  const daily = hourly * (hoursPerWeek / 5);
  const perMinute = hourly / 60;

  return (
    <>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(4, 1fr)" }, gap: 1.5, mb: 2 }}>
        <TextField label="Annual salary" type="number" size="small" value={annual} onChange={(e) => setAnnual(Math.max(0, Number(e.target.value) || 0))} />
        <TextField label="Currency" select size="small" value={currency} onChange={(e) => setCurrency(e.target.value)}>
          {["INR", "USD", "EUR", "GBP"].map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
        </TextField>
        <TextField label="Hours / week" type="number" size="small" value={hoursPerWeek} onChange={(e) => setHoursPerWeek(Math.max(1, Math.min(80, Number(e.target.value) || 40)))} />
        <TextField label="Vacation weeks" type="number" size="small" value={vacationWeeks} onChange={(e) => setVacationWeeks(Math.max(0, Math.min(20, Number(e.target.value) || 0)))} />
      </Box>

      <Box sx={{ p: 3, borderRadius: 2, background: "linear-gradient(135deg, #0b0f1e, #1a1f3a)", color: "#fff", textAlign: "center", mb: 2 }}>
        <Typography variant="overline" sx={{ color: "rgba(255,213,74,0.85)", letterSpacing: 1.5, fontWeight: 800 }}>Hourly equivalent</Typography>
        <Typography sx={{ fontSize: 56, fontWeight: 900, mt: 0.25 }}>{symbols[currency]}{hourly.toLocaleString(undefined, { maximumFractionDigits: 0 })}</Typography>
        <Typography sx={{ color: "rgba(255,255,255,0.7)", fontSize: 13 }}>
          {annualHours.toLocaleString()} working hours per year · {workWeeks} working weeks
        </Typography>
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(5, 1fr)" }, gap: 1.25 }}>
        <Stat label="Per minute" value={`${symbols[currency]}${perMinute.toFixed(2)}`} />
        <Stat label="Per hour" value={`${symbols[currency]}${Math.round(hourly).toLocaleString()}`} />
        <Stat label="Per day" value={`${symbols[currency]}${Math.round(daily).toLocaleString()}`} />
        <Stat label="Per week" value={`${symbols[currency]}${Math.round(weekly).toLocaleString()}`} />
        <Stat label="Per month" value={`${symbols[currency]}${Math.round(monthly).toLocaleString()}`} />
      </Box>

      <Alert severity="info" sx={{ mt: 2 }}>
        Plug this into <strong>Meeting Cost Calculator</strong> or <strong>Recurring Meeting Cost</strong> — knowing the true hourly rate makes the meeting math hit harder.
      </Alert>
    </>
  );
}
