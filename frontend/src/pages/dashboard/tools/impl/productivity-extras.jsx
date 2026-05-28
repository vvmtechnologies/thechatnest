import { useEffect, useMemo, useState } from "react";
import { Box, Button, Chip, MenuItem, Slider, Stack, TextField, Typography } from "@mui/material";
import { ToolSection, monoFont } from "./ToolShell.jsx";

// ─────────────────────────────────────────────────────────────────────
// Unit Converter — categories: length, weight, temperature, volume,
// time, area, speed, data
// ─────────────────────────────────────────────────────────────────────
const UNITS = {
  length: {
    label: "Length",
    base: "m",
    units: { mm: 0.001, cm: 0.01, m: 1, km: 1000, in: 0.0254, ft: 0.3048, yd: 0.9144, mi: 1609.344 },
  },
  weight: {
    label: "Weight",
    base: "g",
    units: { mg: 0.001, g: 1, kg: 1000, oz: 28.3495, lb: 453.592, ton: 1_000_000 },
  },
  volume: {
    label: "Volume",
    base: "L",
    units: { ml: 0.001, L: 1, "gal (US)": 3.78541, "fl oz (US)": 0.0295735, cup: 0.24, tsp: 0.00492892, tbsp: 0.0147868 },
  },
  area: {
    label: "Area",
    base: "m²",
    units: { "m²": 1, "km²": 1_000_000, "ft²": 0.092903, acre: 4046.86, hectare: 10000 },
  },
  speed: {
    label: "Speed",
    base: "m/s",
    units: { "m/s": 1, "km/h": 0.277778, mph: 0.44704, knot: 0.514444 },
  },
  time: {
    label: "Time",
    base: "s",
    units: { ms: 0.001, s: 1, min: 60, hour: 3600, day: 86400, week: 604800, month: 2628000, year: 31536000 },
  },
  data: {
    label: "Data",
    base: "B",
    units: { B: 1, KB: 1024, MB: 1024 ** 2, GB: 1024 ** 3, TB: 1024 ** 4, bit: 0.125, Kbit: 128, Mbit: 131072 },
  },
};

const convertUnits = (value, fromUnit, toUnit, category) => {
  const { units } = UNITS[category];
  return value * units[fromUnit] / units[toUnit];
};

const convertTemp = (value, from, to) => {
  let c = value;
  if (from === "F") c = (value - 32) * 5 / 9;
  else if (from === "K") c = value - 273.15;
  if (to === "C") return c;
  if (to === "F") return c * 9 / 5 + 32;
  return c + 273.15;
};

export function UnitConverter() {
  const [category, setCategory] = useState("length");
  const cat = UNITS[category];
  const [from, setFrom] = useState("m");
  const [to, setTo] = useState("ft");
  const [value, setValue] = useState(1);

  useEffect(() => {
    const list = Object.keys(UNITS[category].units);
    setFrom(list[0]); setTo(list[1] || list[0]);
  }, [category]);

  const result = useMemo(() => {
    const v = Number(value);
    if (!Number.isFinite(v)) return null;
    return convertUnits(v, from, to, category);
  }, [value, from, to, category]);

  return (
    <>
      <Stack direction="row" spacing={1.5} sx={{ mb: 2, flexWrap: "wrap" }}>
        <TextField select size="small" label="Category" value={category} onChange={(e) => setCategory(e.target.value)} sx={{ width: 160 }}>
          {Object.entries(UNITS).map(([k, c]) => <MenuItem key={k} value={k}>{c.label}</MenuItem>)}
          <MenuItem value="temp">Temperature</MenuItem>
        </TextField>
      </Stack>

      {category === "temp" ? <TemperatureConverter /> : (
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mb: 2, alignItems: "center" }}>
          <TextField fullWidth size="small" type="number" label="Value" value={value} onChange={(e) => setValue(e.target.value)} />
          <TextField select fullWidth size="small" label="From" value={from} onChange={(e) => setFrom(e.target.value)}>
            {Object.keys(cat.units).map((u) => <MenuItem key={u} value={u}>{u}</MenuItem>)}
          </TextField>
          <Typography sx={{ fontSize: 24, fontWeight: 800 }}>→</Typography>
          <TextField select fullWidth size="small" label="To" value={to} onChange={(e) => setTo(e.target.value)}>
            {Object.keys(cat.units).map((u) => <MenuItem key={u} value={u}>{u}</MenuItem>)}
          </TextField>
        </Stack>
      )}

      {category !== "temp" && (
        <Box sx={{ p: 3, borderRadius: 2, background: "linear-gradient(135deg, #0b0f1e, #1a1f3a)", color: "#fff", textAlign: "center" }}>
          <Typography variant="overline" sx={{ color: "rgba(255,213,74,0.85)", letterSpacing: 1.5, fontWeight: 800 }}>{value} {from} =</Typography>
          <Typography sx={{ fontSize: 48, fontWeight: 900, mt: 0.25, fontFamily: monoFont }}>
            {result === null ? "—" : Math.abs(result) > 1e6 || (Math.abs(result) < 0.001 && result !== 0) ? result.toExponential(4) : result.toLocaleString(undefined, { maximumFractionDigits: 6 })} {to}
          </Typography>
        </Box>
      )}
    </>
  );
}

const TemperatureConverter = () => {
  const [val, setVal] = useState(100);
  const [from, setFrom] = useState("C");
  const [to, setTo] = useState("F");
  const result = convertTemp(Number(val), from, to);
  return (
    <>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mb: 2, alignItems: "center" }}>
        <TextField fullWidth size="small" type="number" label="Value" value={val} onChange={(e) => setVal(e.target.value)} />
        <TextField select fullWidth size="small" label="From" value={from} onChange={(e) => setFrom(e.target.value)}>
          <MenuItem value="C">°C (Celsius)</MenuItem>
          <MenuItem value="F">°F (Fahrenheit)</MenuItem>
          <MenuItem value="K">K (Kelvin)</MenuItem>
        </TextField>
        <Typography sx={{ fontSize: 24, fontWeight: 800 }}>→</Typography>
        <TextField select fullWidth size="small" label="To" value={to} onChange={(e) => setTo(e.target.value)}>
          <MenuItem value="C">°C</MenuItem>
          <MenuItem value="F">°F</MenuItem>
          <MenuItem value="K">K</MenuItem>
        </TextField>
      </Stack>
      <Box sx={{ p: 3, borderRadius: 2, background: "linear-gradient(135deg, #0b0f1e, #1a1f3a)", color: "#fff", textAlign: "center" }}>
        <Typography variant="overline" sx={{ color: "rgba(255,213,74,0.85)", letterSpacing: 1.5, fontWeight: 800 }}>{val} °{from} =</Typography>
        <Typography sx={{ fontSize: 48, fontWeight: 900, mt: 0.25, fontFamily: monoFont }}>
          {result.toFixed(2)} °{to}
        </Typography>
      </Box>
    </>
  );
};

// ─────────────────────────────────────────────────────────────────────
// Tip Calculator — bill amount, tip %, split by N people
// ─────────────────────────────────────────────────────────────────────
export function TipCalculator() {
  const [bill, setBill] = useState(1500);
  const [tipPct, setTipPct] = useState(15);
  const [people, setPeople] = useState(4);
  const [currency, setCurrency] = useState("INR");
  const symbols = { INR: "₹", USD: "$", EUR: "€", GBP: "£" };
  const tip = (bill * tipPct) / 100;
  const total = bill + tip;
  const perPerson = total / Math.max(1, people);

  return (
    <>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(4, 1fr)" }, gap: 1.5, mb: 3 }}>
        <TextField label="Bill amount" type="number" size="small" value={bill} onChange={(e) => setBill(Math.max(0, Number(e.target.value) || 0))} />
        <TextField label="Currency" select size="small" value={currency} onChange={(e) => setCurrency(e.target.value)}>
          {["INR", "USD", "EUR", "GBP"].map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
        </TextField>
        <TextField label="People" type="number" size="small" value={people} onChange={(e) => setPeople(Math.max(1, Math.min(50, Number(e.target.value) || 1)))} />
        <TextField label="Tip %" type="number" size="small" value={tipPct} onChange={(e) => setTipPct(Math.max(0, Math.min(100, Number(e.target.value) || 0)))} />
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="caption">Tip: {tipPct}%</Typography>
        <Slider value={tipPct} onChange={(_, v) => setTipPct(v)} min={0} max={30} step={1}
          marks={[{value: 10, label: "10%"}, {value: 15, label: "15%"}, {value: 18, label: "18%"}, {value: 20, label: "20%"}, {value: 25, label: "25%"}]} />
      </Box>

      <Box sx={{ p: 3, borderRadius: 2, background: "linear-gradient(135deg, #0b0f1e, #1a1f3a)", color: "#fff", textAlign: "center", mb: 2 }}>
        <Typography variant="overline" sx={{ color: "rgba(255,213,74,0.85)", letterSpacing: 1.5, fontWeight: 800 }}>Per person</Typography>
        <Typography sx={{ fontSize: 48, fontWeight: 900, mt: 0.25 }}>{symbols[currency]}{Math.ceil(perPerson).toLocaleString()}</Typography>
        <Typography sx={{ color: "rgba(255,255,255,0.7)", fontSize: 13 }}>×{people}</Typography>
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "1fr 1fr 1fr" }, gap: 1.25 }}>
        <Stat label="Bill" value={`${symbols[currency]}${bill.toLocaleString()}`} />
        <Stat label="Tip" value={`${symbols[currency]}${Math.round(tip).toLocaleString()}`} />
        <Stat label="Total" value={`${symbols[currency]}${Math.round(total).toLocaleString()}`} highlight />
      </Box>
    </>
  );
}

const Stat = ({ label, value, highlight }) => (
  <Box sx={(theme) => ({ p: 2, borderRadius: 1.5, border: `1px solid ${highlight ? "#f59e0b" : theme.palette.divider}`, bgcolor: highlight ? "rgba(245,158,11,0.08)" : "background.paper", textAlign: "center" })}>
    <Typography variant="caption" sx={{ fontWeight: 800, color: "text.secondary", letterSpacing: 0.4, textTransform: "uppercase", fontSize: 10 }}>{label}</Typography>
    <Typography sx={{ fontSize: 22, fontWeight: 800, mt: 0.25 }}>{value}</Typography>
  </Box>
);

// ─────────────────────────────────────────────────────────────────────
// Date Difference Calculator
// ─────────────────────────────────────────────────────────────────────
export function DateDifference() {
  const today = new Date();
  const in90 = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000);
  const fmt = (d) => d.toISOString().slice(0, 10);
  const [a, setA] = useState(fmt(today));
  const [b, setB] = useState(fmt(in90));

  const diff = useMemo(() => {
    const da = new Date(a);
    const db = new Date(b);
    if (Number.isNaN(da.getTime()) || Number.isNaN(db.getTime())) return null;
    const ms = Math.abs(db - da);
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    let years = db.getFullYear() - da.getFullYear();
    let months = db.getMonth() - da.getMonth() + years * 12;
    const dayPart = db.getDate() - da.getDate();
    if (dayPart < 0) months -= 1;
    years = Math.floor(months / 12);
    const remMonths = months % 12;
    return { days, weeks, hours, minutes, years, remMonths, totalMonths: months };
  }, [a, b]);

  return (
    <>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mb: 3 }}>
        <TextField fullWidth size="small" type="date" label="From" InputLabelProps={{ shrink: true }} value={a} onChange={(e) => setA(e.target.value)} />
        <TextField fullWidth size="small" type="date" label="To" InputLabelProps={{ shrink: true }} value={b} onChange={(e) => setB(e.target.value)} />
      </Stack>

      {diff && (
        <>
          <Box sx={{ p: 3, borderRadius: 2, background: "linear-gradient(135deg, #0b0f1e, #1a1f3a)", color: "#fff", textAlign: "center", mb: 2 }}>
            <Typography variant="overline" sx={{ color: "rgba(255,213,74,0.85)", letterSpacing: 1.5, fontWeight: 800 }}>Difference</Typography>
            <Typography sx={{ fontSize: 44, fontWeight: 900, mt: 0.25 }}>{diff.days.toLocaleString()} days</Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.7)" }}>
              {diff.years > 0 && `${diff.years} year${diff.years > 1 ? "s" : ""} `}
              {diff.remMonths > 0 && `${diff.remMonths} month${diff.remMonths > 1 ? "s" : ""} `}
              {diff.years === 0 && diff.remMonths === 0 && "Less than a month"}
            </Typography>
          </Box>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(4, 1fr)" }, gap: 1.25 }}>
            <Stat label="Weeks" value={diff.weeks.toLocaleString()} />
            <Stat label="Total months" value={diff.totalMonths.toLocaleString()} />
            <Stat label="Hours" value={diff.hours.toLocaleString()} />
            <Stat label="Minutes" value={diff.minutes.toLocaleString()} />
          </Box>
        </>
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Countdown Timer — to a target datetime
// ─────────────────────────────────────────────────────────────────────
export function CountdownTimer() {
  const future = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  future.setMinutes(0, 0, 0);
  const fmt = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}T${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  const [target, setTarget] = useState(fmt(future));
  const [label, setLabel] = useState("Product launch");
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const tDate = new Date(target);
  const diff = tDate.getTime() - now;
  const past = diff < 0;
  const abs = Math.abs(diff);
  const days = Math.floor(abs / 86400000);
  const hours = Math.floor((abs / 3600000) % 24);
  const mins = Math.floor((abs / 60000) % 60);
  const secs = Math.floor((abs / 1000) % 60);

  return (
    <>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mb: 2 }}>
        <TextField fullWidth size="small" label="Event name" value={label} onChange={(e) => setLabel(e.target.value)} />
        <TextField fullWidth size="small" type="datetime-local" label="Target" InputLabelProps={{ shrink: true }} value={target} onChange={(e) => setTarget(e.target.value)} />
      </Stack>

      <Box sx={{ p: 3, borderRadius: 2, background: past ? "linear-gradient(135deg, #b91c1c, #f59e0b)" : "linear-gradient(135deg, #0b0f1e, #1a1f3a)", color: "#fff", textAlign: "center", mb: 2 }}>
        <Typography variant="overline" sx={{ letterSpacing: 1.5, fontWeight: 800 }}>{past ? `${label} was` : label}</Typography>
        <Typography sx={{ fontSize: { xs: 28, sm: 40 }, fontWeight: 900, mt: 0.25, fontFamily: monoFont, letterSpacing: 1 }}>
          {days}d {String(hours).padStart(2, "0")}h {String(mins).padStart(2, "0")}m {String(secs).padStart(2, "0")}s
        </Typography>
        <Typography sx={{ opacity: 0.75, fontSize: 13 }}>
          {past ? `(${tDate.toLocaleString()})` : `until ${tDate.toLocaleString()}`}
        </Typography>
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(4, 1fr)" }, gap: 1.25 }}>
        <Stat label="Days" value={days} />
        <Stat label="Hours" value={hours} />
        <Stat label="Minutes" value={mins} />
        <Stat label="Seconds" value={secs} />
      </Box>
    </>
  );
}
