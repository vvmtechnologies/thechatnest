import { useMemo, useState } from "react";
import { Box, MenuItem, Slider, Stack, TextField, Typography } from "@mui/material";
import { monoFont } from "./ToolShell.jsx";

const Stat = ({ label, value, highlight, accent = "#f59e0b" }) => (
  <Box sx={(theme) => ({ p: 2, borderRadius: 1.5, border: `1px solid ${highlight ? accent : theme.palette.divider}`, bgcolor: highlight ? `${accent}14` : "background.paper", textAlign: "center" })}>
    <Typography variant="caption" sx={{ fontWeight: 800, color: "text.secondary", letterSpacing: 0.4, textTransform: "uppercase", fontSize: 10 }}>{label}</Typography>
    <Typography sx={{ fontSize: 22, fontWeight: 800, mt: 0.25 }}>{value}</Typography>
  </Box>
);

const Hero = ({ label, value, sub }) => (
  <Box sx={{ p: 3, borderRadius: 2, background: "linear-gradient(135deg, #0b0f1e, #1a1f3a)", color: "#fff", textAlign: "center", mb: 2 }}>
    <Typography variant="overline" sx={{ color: "rgba(255,213,74,0.85)", letterSpacing: 1.5, fontWeight: 800 }}>{label}</Typography>
    <Typography sx={{ fontSize: 48, fontWeight: 900, mt: 0.25 }}>{value}</Typography>
    {sub && <Typography sx={{ color: "rgba(255,255,255,0.7)", fontSize: 13 }}>{sub}</Typography>}
  </Box>
);

// ─────────────────────────────────────────────────────────────────────
// Loan EMI Calculator — principal, annual rate, term in months
// ─────────────────────────────────────────────────────────────────────
export function LoanEMI() {
  const [principal, setPrincipal] = useState(2500000);
  const [annualRate, setAnnualRate] = useState(8.5);
  const [months, setMonths] = useState(240);
  const [currency, setCurrency] = useState("INR");
  const sym = { INR: "₹", USD: "$", EUR: "€", GBP: "£" };

  const result = useMemo(() => {
    const r = annualRate / 12 / 100;
    if (r === 0) return { emi: principal / months, totalPaid: principal, totalInterest: 0 };
    const emi = (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
    const totalPaid = emi * months;
    return { emi, totalPaid, totalInterest: totalPaid - principal };
  }, [principal, annualRate, months]);

  return (
    <>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(4, 1fr)" }, gap: 1.5, mb: 2 }}>
        <TextField label="Loan amount" type="number" size="small" value={principal} onChange={(e) => setPrincipal(Math.max(0, Number(e.target.value) || 0))} />
        <TextField label="Currency" select size="small" value={currency} onChange={(e) => setCurrency(e.target.value)}>
          {["INR", "USD", "EUR", "GBP"].map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
        </TextField>
        <TextField label="Rate % p.a." type="number" size="small" value={annualRate} onChange={(e) => setAnnualRate(Math.max(0, Number(e.target.value) || 0))} />
        <TextField label="Months" type="number" size="small" value={months} onChange={(e) => setMonths(Math.max(1, Number(e.target.value) || 1))} />
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography variant="caption">Term (years): {(months / 12).toFixed(1)}</Typography>
        <Slider value={months} onChange={(_, v) => setMonths(v)} min={12} max={360} step={12}
          marks={[{ value: 60, label: "5y" }, { value: 120, label: "10y" }, { value: 240, label: "20y" }, { value: 360, label: "30y" }]} />
      </Box>

      <Hero label="Monthly EMI" value={`${sym[currency]}${Math.round(result.emi).toLocaleString()}`} sub={`${months} payments`} />

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "1fr 1fr 1fr" }, gap: 1.25 }}>
        <Stat label="Total paid" value={`${sym[currency]}${Math.round(result.totalPaid).toLocaleString()}`} />
        <Stat label="Total interest" value={`${sym[currency]}${Math.round(result.totalInterest).toLocaleString()}`} highlight accent="#dc2626" />
        <Stat label="Interest / principal" value={`${((result.totalInterest / principal) * 100).toFixed(0)}%`} />
      </Box>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Compound Interest Calculator
// ─────────────────────────────────────────────────────────────────────
export function CompoundInterest() {
  const [principal, setPrincipal] = useState(100000);
  const [rate, setRate] = useState(8);
  const [years, setYears] = useState(10);
  const [freq, setFreq] = useState(12); // compoundings per year
  const [contrib, setContrib] = useState(5000); // monthly contribution
  const [currency, setCurrency] = useState("INR");
  const sym = { INR: "₹", USD: "$", EUR: "€", GBP: "£" };

  const result = useMemo(() => {
    const n = freq;
    const r = rate / 100;
    const t = years;
    const lumpFinal = principal * Math.pow(1 + r / n, n * t);
    // Future value of annuity, monthly contributions
    const monthlyRate = r / 12;
    let contribFinal;
    if (monthlyRate === 0) contribFinal = contrib * 12 * t;
    else contribFinal = contrib * ((Math.pow(1 + monthlyRate, 12 * t) - 1) / monthlyRate);
    const total = lumpFinal + contribFinal;
    const totalContrib = principal + contrib * 12 * t;
    return { total, lumpFinal, contribFinal, totalContrib, interest: total - totalContrib };
  }, [principal, rate, years, freq, contrib]);

  return (
    <>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(4, 1fr)" }, gap: 1.5, mb: 2 }}>
        <TextField label="Initial deposit" type="number" size="small" value={principal} onChange={(e) => setPrincipal(Math.max(0, Number(e.target.value) || 0))} />
        <TextField label="Currency" select size="small" value={currency} onChange={(e) => setCurrency(e.target.value)}>
          {["INR", "USD", "EUR", "GBP"].map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
        </TextField>
        <TextField label="Rate % p.a." type="number" size="small" value={rate} onChange={(e) => setRate(Math.max(0, Number(e.target.value) || 0))} />
        <TextField label="Years" type="number" size="small" value={years} onChange={(e) => setYears(Math.max(1, Number(e.target.value) || 1))} />
        <TextField label="Compounding / yr" select size="small" value={freq} onChange={(e) => setFreq(Number(e.target.value))}>
          <MenuItem value={1}>Annually</MenuItem>
          <MenuItem value={2}>Semi-annual</MenuItem>
          <MenuItem value={4}>Quarterly</MenuItem>
          <MenuItem value={12}>Monthly</MenuItem>
          <MenuItem value={365}>Daily</MenuItem>
        </TextField>
        <TextField label="Monthly contribution" type="number" size="small" value={contrib} onChange={(e) => setContrib(Math.max(0, Number(e.target.value) || 0))} />
      </Box>

      <Hero label={`After ${years} years`} value={`${sym[currency]}${Math.round(result.total).toLocaleString()}`} />

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(4, 1fr)" }, gap: 1.25 }}>
        <Stat label="You invested" value={`${sym[currency]}${Math.round(result.totalContrib).toLocaleString()}`} />
        <Stat label="Interest earned" value={`${sym[currency]}${Math.round(result.interest).toLocaleString()}`} highlight accent="#22c55e" />
        <Stat label="From lump sum" value={`${sym[currency]}${Math.round(result.lumpFinal).toLocaleString()}`} />
        <Stat label="From contributions" value={`${sym[currency]}${Math.round(result.contribFinal).toLocaleString()}`} />
      </Box>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Discount Calculator
// ─────────────────────────────────────────────────────────────────────
export function DiscountCalc() {
  const [price, setPrice] = useState(2999);
  const [discount, setDiscount] = useState(25);
  const [currency, setCurrency] = useState("INR");
  const sym = { INR: "₹", USD: "$", EUR: "€", GBP: "£" };
  const saved = (price * discount) / 100;
  const final = price - saved;

  return (
    <>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(3, 1fr)" }, gap: 1.5, mb: 2 }}>
        <TextField label="Original price" type="number" size="small" value={price} onChange={(e) => setPrice(Math.max(0, Number(e.target.value) || 0))} />
        <TextField label="Currency" select size="small" value={currency} onChange={(e) => setCurrency(e.target.value)}>
          {["INR", "USD", "EUR", "GBP"].map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
        </TextField>
        <TextField label="Discount %" type="number" size="small" value={discount} onChange={(e) => setDiscount(Math.max(0, Math.min(100, Number(e.target.value) || 0)))} />
      </Box>

      <Box sx={{ mb: 2 }}>
        <Slider value={discount} onChange={(_, v) => setDiscount(v)} min={0} max={90} step={1}
          marks={[{ value: 10, label: "10%" }, { value: 25, label: "25%" }, { value: 50, label: "50%" }, { value: 75, label: "75%" }]} />
      </Box>

      <Hero label="Final price" value={`${sym[currency]}${final.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} sub={`You save ${sym[currency]}${saved.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} />

      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1.25 }}>
        <Stat label="Original" value={`${sym[currency]}${price.toLocaleString()}`} />
        <Stat label="You save" value={`${sym[currency]}${Math.round(saved).toLocaleString()}`} highlight accent="#22c55e" />
        <Stat label="You pay" value={`${sym[currency]}${Math.round(final).toLocaleString()}`} highlight accent="#2563eb" />
      </Box>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Aspect Ratio Calculator
// ─────────────────────────────────────────────────────────────────────
const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));

export function AspectRatioCalc() {
  const [w1, setW1] = useState(1920);
  const [h1, setH1] = useState(1080);
  const [target, setTarget] = useState("w");
  const [w2, setW2] = useState(1280);
  const [h2, setH2] = useState(720);

  const g = useMemo(() => gcd(Math.max(1, w1), Math.max(1, h1)), [w1, h1]);
  const ratio = `${w1 / g}:${h1 / g}`;
  const ar = w1 / h1;

  const compute = (newW, newH) => {
    if (target === "w") {
      setW2(newW);
      setH2(Math.round(newW / ar));
    } else {
      setH2(newH);
      setW2(Math.round(newH * ar));
    }
  };

  return (
    <>
      <Stack direction="row" spacing={1.5} sx={{ mb: 2, alignItems: "center", flexWrap: "wrap" }}>
        <TextField label="Width 1" type="number" size="small" value={w1} onChange={(e) => setW1(Math.max(1, Number(e.target.value) || 1))} sx={{ width: 130 }} />
        <Typography sx={{ alignSelf: "center", fontSize: 24, fontWeight: 800 }}>×</Typography>
        <TextField label="Height 1" type="number" size="small" value={h1} onChange={(e) => setH1(Math.max(1, Number(e.target.value) || 1))} sx={{ width: 130 }} />
        <Box sx={{ flex: 1 }} />
      </Stack>

      <Hero label="Aspect ratio" value={ratio} sub={`${ar.toFixed(3)} : 1`} />

      <Typography variant="caption" sx={{ display: "block", mb: 1, fontWeight: 700, color: "text.secondary" }}>
        Solve for new dimensions (same ratio)
      </Typography>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", flexWrap: "wrap" }}>
        <TextField select size="small" label="I know" value={target} onChange={(e) => setTarget(e.target.value)} sx={{ width: 130 }}>
          <MenuItem value="w">Width</MenuItem>
          <MenuItem value="h">Height</MenuItem>
        </TextField>
        {target === "w" ? (
          <TextField label="New width" type="number" size="small" value={w2} onChange={(e) => compute(Math.max(1, Number(e.target.value) || 1), h2)} sx={{ width: 150 }} />
        ) : (
          <TextField label="New height" type="number" size="small" value={h2} onChange={(e) => compute(w2, Math.max(1, Number(e.target.value) || 1))} sx={{ width: 150 }} />
        )}
        <Typography sx={{ fontSize: 24, fontWeight: 800 }}>=</Typography>
        <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: "rgba(99,102,241,0.12)", color: "#4338ca", fontWeight: 800, fontSize: 18, fontFamily: monoFont }}>
          {w2} × {h2}
        </Box>
      </Stack>
    </>
  );
}
