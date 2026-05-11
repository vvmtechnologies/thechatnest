import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PiCheckBold, PiArrowRightBold, PiStarFill } from "react-icons/pi";
import { API_BASE_URL } from "../../config/apiBaseUrl";

const fallbackPerks = (plan) => [
  `Up to ${Number(plan?.max_users || 10).toLocaleString()} users`,
  `${Math.max(1, Math.round(Number(plan?.max_storage_mb || 1000) / 1000))} GB storage`,
  `Billing every ${Number(plan?.interval_days || 30)} days`,
];

const getTagline = (plan, index, total) => {
  const price = Number(plan?.price || 0);
  if (price === 0) return "For trying things out";
  if (index === 0 || index === 1) return "Best for small teams";
  if (index === total - 1) return "For organizations at scale";
  return "Most teams start here";
};

const currencySymbol = (code) => {
  const c = String(code || "INR").toUpperCase();
  if (c === "INR") return "₹";
  if (c === "USD") return "$";
  if (c === "EUR") return "€";
  if (c === "GBP") return "£";
  return c + " ";
};

const HomePriceComponent = () => {
  const [billing, setBilling] = useState("yearly"); // monthly | yearly
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!API_BASE_URL) return;
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/plans?limit=50&offset=0`, {
          headers: { Accept: "application/json" },
          credentials: "include",
        });
        const payload = await res.json().catch(() => ({}));
        const rows = Array.isArray(payload?.data?.rows) ? payload.data.rows : [];
        const normalized = rows
          .filter((r) => String(r?.status || "").toLowerCase() !== "inactive")
          .sort((a, b) => Number(a?.price || 0) - Number(b?.price || 0));
        if (!cancelled) setPlans(normalized);
      } catch {
        if (!cancelled) setPlans([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const popularIndex = useMemo(() => {
    if (!plans.length) return -1;
    // Pick the second-cheapest paid plan as "Most Popular"
    const paid = plans.filter((p) => Number(p?.price || 0) > 0);
    if (paid.length >= 2) return plans.indexOf(paid[1]);
    if (paid.length === 1) return plans.indexOf(paid[0]);
    return -1;
  }, [plans]);

  return (
    <section className="section-soft" style={{ padding: "6rem 0" }}>
      <div className="container">
        <div className="section-title">
          <span className="eyebrow">Pricing</span>
          <h2 style={{ marginTop: "1rem" }}>Simple pricing that scales with you</h2>
          <p>
            Start free for 14 days — no credit card needed. Choose monthly or save 20% with yearly billing.
            Cancel anytime.
          </p>
        </div>

        {/* Billing toggle */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "2.5rem" }}>
          <div
            style={{
              display: "inline-flex",
              background: "#fff",
              border: "1px solid var(--tcn-border)",
              borderRadius: 999,
              padding: 4,
              boxShadow: "var(--tcn-shadow-sm)",
              position: "relative",
            }}
          >
            <button
              onClick={() => setBilling("monthly")}
              style={{
                padding: "0.55rem 1.4rem",
                border: "none",
                borderRadius: 999,
                background: billing === "monthly" ? "var(--tcn-navy-900)" : "transparent",
                color: billing === "monthly" ? "#fff" : "var(--tcn-ink-700)",
                fontWeight: 600,
                fontSize: "0.92rem",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling("yearly")}
              style={{
                padding: "0.55rem 1.4rem",
                border: "none",
                borderRadius: 999,
                background: billing === "yearly" ? "var(--tcn-navy-900)" : "transparent",
                color: billing === "yearly" ? "#fff" : "var(--tcn-ink-700)",
                fontWeight: 600,
                fontSize: "0.92rem",
                cursor: "pointer",
                transition: "all 0.2s ease",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              Yearly
              <span
                style={{
                  background: "linear-gradient(135deg, #22c55e, #16a34a)",
                  color: "#fff",
                  fontSize: "0.7rem",
                  padding: "2px 8px",
                  borderRadius: 999,
                  fontWeight: 700,
                }}
              >
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Plan cards */}
        {loading && !plans.length ? (
          <div style={{ textAlign: "center", padding: "3rem 0", color: "var(--tcn-ink-500)" }}>
            Loading plans…
          </div>
        ) : !plans.length ? (
          <div style={{ textAlign: "center", padding: "3rem 0", color: "var(--tcn-ink-500)" }}>
            Plans coming soon.
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${Math.min(plans.length, 4)}, minmax(0, 1fr))`,
              gap: "1.25rem",
            }}
          >
            {plans.map((plan, i) => {
              const monthlyPrice = Number(plan?.price || 0);
              const yearlyPriceFull = monthlyPrice * 12;
              const yearlyPriceDiscounted = Math.round(yearlyPriceFull * 0.8);
              const displayPrice =
                billing === "yearly"
                  ? Math.round(yearlyPriceDiscounted / 12)
                  : monthlyPrice;
              const isPopular = i === popularIndex;
              const isFree = monthlyPrice === 0;
              const sym = currencySymbol(plan?.default_currency);
              const perks = Array.isArray(plan?.perks) && plan.perks.length ? plan.perks : fallbackPerks(plan);

              return (
                <div
                  key={plan?.plan_id || i}
                  className="tcn-plan-card"
                  style={{
                    position: "relative",
                    background: isPopular
                      ? "linear-gradient(180deg, #1a1f3a 0%, #0b0f1e 100%)"
                      : "#fff",
                    color: isPopular ? "#fff" : "var(--tcn-ink-900)",
                    border: isPopular
                      ? "1px solid rgba(255,213,74,0.35)"
                      : "1px solid var(--tcn-border)",
                    borderRadius: "var(--tcn-radius-lg)",
                    padding: "2rem 1.6rem",
                    boxShadow: isPopular ? "var(--tcn-shadow-glow)" : "var(--tcn-shadow-sm)",
                    transform: isPopular ? "translateY(-8px)" : "none",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  }}
                >
                  {isPopular && (
                    <div
                      style={{
                        position: "absolute",
                        top: -14,
                        left: "50%",
                        transform: "translateX(-50%)",
                        background: "linear-gradient(135deg, #ffd54a, #ffb74d)",
                        color: "#1a1f3a",
                        padding: "0.35rem 0.85rem",
                        borderRadius: 999,
                        fontSize: "0.72rem",
                        fontWeight: 800,
                        letterSpacing: "0.05em",
                        textTransform: "uppercase",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                        boxShadow: "0 4px 14px rgba(255,213,74,0.4)",
                      }}
                    >
                      <PiStarFill size={11} /> Most popular
                    </div>
                  )}

                  <div style={{ marginBottom: "1.25rem" }}>
                    <h3
                      style={{
                        fontSize: "1.3rem",
                        fontWeight: 700,
                        marginBottom: "0.35rem",
                        color: isPopular ? "#fff" : "var(--tcn-ink-900)",
                      }}
                    >
                      {plan?.plan_name || plan?.plan_key || "Plan"}
                    </h3>
                    <p
                      style={{
                        margin: 0,
                        color: isPopular ? "rgba(255,255,255,0.6)" : "var(--tcn-ink-500)",
                        fontSize: "0.9rem",
                      }}
                    >
                      {getTagline(plan, i, plans.length)}
                    </p>
                  </div>

                  <div style={{ marginBottom: "1.5rem" }}>
                    {isFree ? (
                      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                        <span style={{ fontSize: "2.5rem", fontWeight: 800, lineHeight: 1 }}>
                          Free
                        </span>
                      </div>
                    ) : (
                      <>
                        <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                          <span
                            style={{
                              fontSize: "1.1rem",
                              fontWeight: 600,
                              color: isPopular ? "rgba(255,255,255,0.7)" : "var(--tcn-ink-500)",
                            }}
                          >
                            {sym}
                          </span>
                          <span style={{ fontSize: "2.6rem", fontWeight: 800, lineHeight: 1 }}>
                            {displayPrice.toLocaleString()}
                          </span>
                          <span
                            style={{
                              fontSize: "0.92rem",
                              color: isPopular ? "rgba(255,255,255,0.6)" : "var(--tcn-ink-500)",
                            }}
                          >
                            /user/mo
                          </span>
                        </div>
                        {billing === "yearly" && (
                          <div
                            style={{
                              marginTop: 6,
                              fontSize: "0.82rem",
                              color: isPopular ? "rgba(255,255,255,0.55)" : "var(--tcn-ink-500)",
                            }}
                          >
                            Billed {sym}{yearlyPriceDiscounted.toLocaleString()}/yr — save {sym}
                            {(yearlyPriceFull - yearlyPriceDiscounted).toLocaleString()}
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  <Link
                    to={isFree ? "/auth/register" : `/pricing?plan=${plan?.plan_key || plan?.plan_id}`}
                    style={{
                      display: "block",
                      textAlign: "center",
                      padding: "0.8rem 1rem",
                      borderRadius: 999,
                      background: isPopular
                        ? "linear-gradient(135deg, #ffd54a, #ffb74d)"
                        : isFree
                        ? "#0b0f1e"
                        : "transparent",
                      color: isPopular ? "#1a1f3a" : isFree ? "#fff" : "var(--tcn-ink-900)",
                      border: isPopular
                        ? "1px solid transparent"
                        : isFree
                        ? "1px solid #0b0f1e"
                        : "1.5px solid var(--tcn-ink-900)",
                      fontWeight: 700,
                      fontSize: "0.95rem",
                      marginBottom: "1.5rem",
                      textDecoration: "none",
                      transition: "transform 0.18s ease, box-shadow 0.18s ease",
                      boxShadow: isPopular ? "0 6px 18px rgba(255,213,74,0.3)" : "none",
                    }}
                  >
                    {isFree ? "Get started free" : "Start 14-day trial"}
                  </Link>

                  <div
                    style={{
                      borderTop: isPopular
                        ? "1px solid rgba(255,255,255,0.1)"
                        : "1px solid var(--tcn-border)",
                      paddingTop: "1.25rem",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        color: isPopular ? "rgba(255,255,255,0.55)" : "var(--tcn-ink-500)",
                        marginBottom: "0.85rem",
                      }}
                    >
                      What's included
                    </div>
                    <ul
                      style={{
                        listStyle: "none",
                        padding: 0,
                        margin: 0,
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.65rem",
                      }}
                    >
                      {perks.slice(0, 5).map((perk, idx) => (
                        <li
                          key={idx}
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 10,
                            fontSize: "0.88rem",
                            color: isPopular ? "rgba(255,255,255,0.85)" : "var(--tcn-ink-700)",
                            lineHeight: 1.5,
                          }}
                        >
                          <span
                            style={{
                              flexShrink: 0,
                              width: 18,
                              height: 18,
                              borderRadius: 999,
                              background: isPopular
                                ? "rgba(255,213,74,0.18)"
                                : "rgba(34,197,94,0.12)",
                              color: isPopular ? "#ffd54a" : "#16a34a",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              marginTop: 2,
                            }}
                          >
                            <PiCheckBold size={11} strokeWidth={3} />
                          </span>
                          <span>{perk}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ textAlign: "center", marginTop: "2.5rem" }}>
          <Link
            to="/pricing"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              color: "var(--tcn-violet-600)",
              fontWeight: 600,
              fontSize: "0.95rem",
            }}
          >
            Compare all plans & features <PiArrowRightBold size={14} />
          </Link>
        </div>
      </div>

      <style>{`
        .tcn-plan-card:hover {
          transform: translateY(-4px) !important;
        }
        .tcn-plan-card:hover[style*="rgba(255,213,74,0.35)"] {
          transform: translateY(-12px) !important;
        }
        @media (max-width: 992px) {
          section .container > div[style*="grid-template-columns"] {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
        }
        @media (max-width: 576px) {
          section .container > div[style*="grid-template-columns"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
};

export default HomePriceComponent;
