export function AboutStrip() {
  const sources = [
    "UN DESA",
    "OWID",
    "World Bank",
    "IMF",
    "UN Tourism",
    "IEA",
    "NOAA",
    "Wikivoyage",
    "Wikipedia",
    "Booking",
    "Agoda",
    "Expedia",
    "Mastercard GDCI",
    "OpenSky",
  ];
  return (
    <div className="section">
      <div className="about-strip">
        <div>
          <h3>Where this data comes from</h3>
          <p>
            Aggregated from open datasets and live feeds. Tickers are projections from published rates; nothing here is invented. Every
            number traces back to a public source.
          </p>
        </div>
        <div className="sources">
          {sources.map((s, i) => (
            <span key={i} className="source-pill">
              {s}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
