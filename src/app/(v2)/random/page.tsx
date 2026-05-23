"use client";

import { useState, useEffect } from "react";
import { Shuffle } from "lucide-react";
import { SEED } from "@/lib/wsl-v2/seed";

export default function RandomPage() {
  const [factIdx, setFactIdx] = useState(0);
  const [countryIdx, setCountryIdx] = useState(0);

  const roll = () => {
    setFactIdx(Math.floor(Math.random() * SEED.facts.length));
    setCountryIdx(Math.floor(Math.random() * SEED.countries.length));
  };

  useEffect(() => { roll(); }, []);

  const fact = SEED.facts[factIdx];
  const country = SEED.countries[countryIdx];

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="crumb">RANDOM</div>
          <h1>Spin the globe.</h1>
          <div className="sub">One random fact. One random country. Every time.</div>
        </div>
        <button className="btn btn-primary" onClick={roll} type="button">
          <Shuffle size={16} /> Roll again
        </button>
      </div>

      {fact && (
        <div className="section">
          <div className="section-head"><div><h2>Random fact</h2></div></div>
          <div className="fact-card" style={{ minHeight: 120 }}>
            <div className="fact-text" dangerouslySetInnerHTML={{ __html: fact.text }} />
            <div className="fact-src mono">{fact.src}</div>
          </div>
        </div>
      )}

      {country && (
        <div className="section">
          <div className="section-head"><div><h2>Random country</h2></div></div>
          <div className="country-card" data-accent={country.accent} style={{ maxWidth: 400 }}>
            <div className="ticker-accent" style={{ background: `var(--ws-${country.accent})` }} />
            <div className="cc-head">
              <span style={{ fontSize: 32 }}>{country.flag}</span>
              <div>
                <div className="cc-name">{country.name}</div>
                <div className="cc-region">{country.region}</div>
              </div>
            </div>
            <div className="cc-stats">
              <div className="cc-stat">visitors/yr<b>{country.visitors}</b></div>
              <div className="cc-stat">population<b>{(country.pop / 1e6).toFixed(1)}M</b></div>
              <div className="cc-stat">GDP<b>{country.gdp}</b></div>
              <div className="cc-stat">
                growth
                <b style={{ color: country.up ? "var(--success)" : "var(--destructive)" }}>
                  {country.growth}
                </b>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
