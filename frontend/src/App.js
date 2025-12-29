import { useState, useEffect } from "react";
import "./App.css";
import AOS from "aos";
import "aos/dist/aos.css";

/* ---------- SMALL COMPONENTS ---------- */

function ProgressRow({ label, status }) {
  return (
    <div className="progress-row">
      <span>{label}</span>
      <div className={`bar ${status}`}>
        {status === "good" && "GOOD"}
        {status === "warning" && "WEAK"}
        {status === "bad" && "BROKEN"}
      </div>
    </div>
  );
}

/* ---------- MAIN APP ---------- */

function App() {
  useEffect(() => {
    document.title = "Trade Autopsy";
    AOS.init({ duration: 900, once: true, easing: "ease-out-cubic" });
  }, []);

  const [trade, setTrade] = useState({
    capital: "",
    entry_price: "",
    exit_price: "",
    stop_loss: "",
    quantity: "",
    direction: "long"
  });

  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);

  const handleChange = (e) => {
    setTrade({ ...trade, [e.target.name]: e.target.value });
  };

  const analyzeTrade = async () => {
    const res = await fetch("https://trade-autopsy-api.onrender.com/analyze-trade", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...trade,
        capital: Number(trade.capital),
        entry_price: Number(trade.entry_price),
        exit_price: Number(trade.exit_price),
        stop_loss: Number(trade.stop_loss),
        quantity: Number(trade.quantity)
      })
    });

    const data = await res.json();
    setResult(data);

    // store last 5 autopsies
    setHistory((prev) =>
      [{ severity: data.severity, insights: data.insights }, ...prev].slice(0, 5)
    );
  };

  const loadDemo = () => {
    setTrade({
      capital: 100000,
      entry_price: 500,
      exit_price: 540,
      stop_loss: 490,
      quantity: 300,
      direction: "long"
    });
  };

  /* ---------- DERIVED INSIGHTS ---------- */

  const verdict =
    result?.severity === 3
      ? "HIGH RISK"
      : result?.severity === 2
      ? "QUESTIONABLE"
      : "DISCIPLINED";

  const mistakeCount = {};
  history.forEach((h) =>
    h.insights.forEach((i) => {
      mistakeCount[i.message] = (mistakeCount[i.message] || 0) + 1;
    })
  );

  const mostCommonMistake =
    Object.entries(mistakeCount).sort((a, b) => b[1] - a[1])[0]?.[0] ||
    "No repeated mistakes yet.";

  const weeklyScore =
    history.length === 0
      ? "—"
      : Math.round(
          (history.filter((h) => h.severity === 1).length / history.length) * 100
        );

  return (
    <div className="app">

      {/* HERO */}
      <section className="hero" data-aos="fade-down">
        <h1 className="hero-title">
          TRADE<br /><span>AUTOPSY</span>
        </h1>
        <p className="hero-sub">
          Not signals. Not predictions.<br />
          <strong>Understand your mistakes.</strong>
        </p>
      </section>

      {/* HOW IT WORKS */}
      <section className="glass section" data-aos="fade-up">
        <h2>How This Helps You</h2>
        <div className="steps simple">
          <div>1️⃣ Enter a trade you already took</div>
          <div>2️⃣ We check basic trading rules</div>
          <div>3️⃣ Mistakes are clearly shown</div>
          <div>4️⃣ You know what to fix next time</div>
        </div>
      </section>

      {/* RULES */}
      <section className="section rules" data-aos="fade-up">
        <h2>Non-Negotiable Rules</h2>
        <div className="rules-grid">
          <div className="rule-card">❌ Risk more than 1% → Bad trade</div>
          <div className="rule-card">⚠️ Low reward vs risk → Weak setup</div>
          <div className="rule-card">❌ No stop-loss → Gambling</div>
          <div className="rule-card">❌ Wrong quantity → Overexposed</div>
        </div>
      </section>

      {/* INPUT */}
      <section className="glass section" data-aos="zoom-in">
        <h2>Analyze a Trade</h2>

        <input name="capital" placeholder="Capital" value={trade.capital} onChange={handleChange} />
        <input name="entry_price" placeholder="Entry Price" value={trade.entry_price} onChange={handleChange} />
        <input name="exit_price" placeholder="Exit Price" value={trade.exit_price} onChange={handleChange} />
        <input name="stop_loss" placeholder="Stop Loss" value={trade.stop_loss} onChange={handleChange} />
        <input name="quantity" placeholder="Quantity" value={trade.quantity} onChange={handleChange} />

        <select name="direction" value={trade.direction} onChange={handleChange}>
          <option value="long">LONG</option>
          <option value="short">SHORT</option>
        </select>

        <div className="button-row">
          <button onClick={analyzeTrade}>RUN AUTOPSY</button>
          <button className="ghost" onClick={loadDemo}>LOAD DEMO</button>
        </div>
      </section>

      {/* RESULTS */}
      {result && (
        <>
          <section className="glass section" data-aos="fade-up">
            <h2 className={`verdict ${verdict.toLowerCase().replace(" ", "-")}`}>
              TRADE VERDICT: {verdict}
            </h2>

            <div className="metrics">
              <div><span>P&L</span>₹{result.analysis.pnl}</div>
              <div><span>RISK %</span>{result.analysis.risk_pct}%</div>
              <div><span>R:R</span>{result.analysis.rr_ratio}</div>
            </div>

            <h3>What You Did Wrong</h3>
            {result.insights.map((i, idx) => (
              <div key={idx} className={`insight ${i.type}`}>
                {i.message}
              </div>
            ))}
          </section>

          {/* DISCIPLINE BREAKDOWN */}
          <section className="glass section" data-aos="fade-up">
            <h2>Your Trading Discipline</h2>

            <ProgressRow
              label="Risk Management"
              status={result.analysis.risk_pct <= 1 ? "good" : "bad"}
            />
            <ProgressRow
              label="Risk–Reward Planning"
              status={result.analysis.rr_ratio >= 1.5 ? "good" : "warning"}
            />
            <ProgressRow
              label="Stop-Loss Discipline"
              status={trade.stop_loss > 0 ? "good" : "bad"}
            />
          </section>
        </>
      )}

      {/* LEARNING SECTIONS */}
      {history.length > 0 && (
        <section className="glass section" data-aos="fade-up">
          <h2>Your Progress</h2>

          <p><strong>Weekly Discipline Score:</strong> {weeklyScore}%</p>
          <p><strong>Most Common Mistake:</strong> {mostCommonMistake}</p>

          <h3>Last 5 Autopsies</h3>
          <ul className="history">
            {history.map((h, i) => (
              <li key={i}>
                Trade {i + 1} — Severity {h.severity}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* FOOTER */}
      <footer className="footer">
        <p>Trade Autopsy — Discipline over dopamine</p>
      </footer>
    </div>
  );
}

export default App;
