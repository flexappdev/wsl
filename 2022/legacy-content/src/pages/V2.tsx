import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Users,
  Globe,
  Leaf,
  Droplets,
  Zap,
  HeartPulse,
  Wifi,
  ShoppingCart,
  Menu,
  Search,
  Github,
  Twitter,
  Map,
  BarChart3,
  ChevronRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// --- Mock Data & Configuration ---

type SectionItem = {
  label: string;
  initial: number;
  rate: number;
  main?: boolean;
  isDaily?: boolean;
  color?: string;
  format?: "currency" | "standard";
};

type Section = {
  id: string;
  title: string;
  icon: LucideIcon;
  color: string;
  items: SectionItem[];
};

const SECTIONS: Section[] = [
  {
    id: "population",
    title: "World Population",
    icon: Users,
    color: "text-slate-100",
    items: [
      { label: "Current World Population", initial: 8100345000, rate: 2.6, main: true },
      { label: "Births this year", initial: 45123000, rate: 4.3, color: "text-green-400" },
      { label: "Births today", initial: 230000, rate: 4.3, isDaily: true, color: "text-green-400" },
      { label: "Deaths this year", initial: 18900000, rate: 1.9, color: "text-red-400" },
      { label: "Deaths today", initial: 102000, rate: 1.9, isDaily: true, color: "text-red-400" },
      { label: "Net population growth this year", initial: 26223000, rate: 2.4, color: "text-blue-400" },
    ],
  },
  {
    id: "gdp",
    title: "Gross Domestic Product",
    icon: BarChart3,
    color: "text-emerald-400",
    items: [
      { label: "Gross World Product (GWP)", initial: 109500000000000, rate: 105000, format: "currency", color: "text-emerald-300" },
      { label: "USA GDP", initial: 28000000000000, rate: 25000, format: "currency", color: "text-green-300" },
      { label: "China GDP", initial: 19000000000000, rate: 30000, format: "currency", color: "text-red-300" },
      { label: "European Union GDP", initial: 17500000000000, rate: 20000, format: "currency", color: "text-blue-300" },
      { label: "India GDP", initial: 4100000000000, rate: 15000, format: "currency", color: "text-orange-300" },
      { label: "Japan GDP", initial: 4200000000000, rate: 5000, format: "currency", color: "text-rose-300" },
    ],
  },
  {
    id: "economics",
    title: "Government & Economics",
    icon: Globe,
    color: "text-blue-300",
    items: [
      { label: "Public Healthcare Expenditure ($)", initial: 14500300000000, rate: 250000, format: "currency" },
      { label: "Public Education Expenditure ($)", initial: 12100000000000, rate: 180000, format: "currency" },
      { label: "Military Expenditure ($)", initial: 5500000000000, rate: 80000, format: "currency" },
      { label: "Cars produced this year", initial: 24000000, rate: 2.1 },
      { label: "Bicycles produced this year", initial: 48000000, rate: 4.5 },
      { label: "Computers produced this year", initial: 95000000, rate: 5.2 },
    ],
  },
  {
    id: "media",
    title: "Society & Media",
    icon: Wifi,
    color: "text-violet-400",
    items: [
      { label: "New book titles published", initial: 950000, rate: 0.8 },
      { label: "Newspapers circulated", initial: 120000000, rate: 5.5 },
      { label: "TV sets sold worldwide", initial: 85000000, rate: 3.2 },
      { label: "Cellular phones sold", initial: 450000000, rate: 15.5 },
      { label: "Money spent on videogames ($)", initial: 180000000000, rate: 5500, format: "currency" },
      { label: "Internet users in the world", initial: 5600000000, rate: 3.5 },
    ],
  },
  {
    id: "environment",
    title: "Environment",
    icon: Leaf,
    color: "text-emerald-400",
    items: [
      { label: "Forest loss this year (hectares)", initial: 1500000, rate: 0.4, color: "text-red-400" },
      { label: "Land lost to soil erosion (ha)", initial: 2200000, rate: 0.6, color: "text-red-400" },
      { label: "CO2 emissions (tons)", initial: 11000000000, rate: 1200, color: "text-slate-400" },
      { label: "Desertification this year (hectares)", initial: 3500000, rate: 0.9, color: "text-amber-400" },
      { label: "Toxic chemicals released (tons)", initial: 3100000, rate: 0.8, color: "text-lime-400" },
    ],
  },
  {
    id: "food",
    title: "Food",
    icon: ShoppingCart,
    color: "text-yellow-400",
    items: [
      { label: "Undernourished people", initial: 840000000, rate: 0.1, color: "text-orange-400" },
      { label: "Overweight people", initial: 1750000000, rate: 0.8, color: "text-yellow-400" },
      { label: "Obese people", initial: 810000000, rate: 0.4, color: "text-red-400" },
      { label: "People who died of hunger today", initial: 14000, rate: 0.3, isDaily: true, color: "text-red-500" },
      { label: "Money spent on obesity related diseases ($)", initial: 250000000000, rate: 7000, format: "currency" },
    ],
  },
  {
    id: "water",
    title: "Water",
    icon: Droplets,
    color: "text-blue-400",
    items: [
      { label: "Water consumed this year (million L)", initial: 1500000000, rate: 1500, format: "standard" },
      { label: "Deaths from water related diseases", initial: 280000, rate: 0.05, color: "text-red-400" },
      { label: "People with no safe drinking water", initial: 780000000, rate: -0.01, color: "text-slate-400" },
    ],
  },
  {
    id: "energy",
    title: "Energy",
    icon: Zap,
    color: "text-amber-400",
    items: [
      { label: "Energy used today (MWh)", initial: 145000000, rate: 12000, isDaily: true, format: "standard" },
      { label: "Non-renewable sources (MWh)", initial: 120000000, rate: 9500, isDaily: true, color: "text-red-400" },
      { label: "Renewable sources (MWh)", initial: 25000000, rate: 2500, isDaily: true, color: "text-green-400" },
      { label: "Solar energy hitting earth today (MWh)", initial: 450000000000, rate: 5000000, isDaily: true, color: "text-yellow-300" },
      { label: "Oil pumped today (barrels)", initial: 45000000, rate: 400, isDaily: true },
    ],
  },
  {
    id: "health",
    title: "Health",
    icon: HeartPulse,
    color: "text-rose-400",
    items: [
      { label: "Communicable disease deaths", initial: 4100000, rate: 0.4, color: "text-red-400" },
      { label: "Deaths of children under 5", initial: 2100000, rate: 0.2, color: "text-red-400" },
      { label: "Abortions this year", initial: 14000000, rate: 1.4, color: "text-slate-400" },
      { label: "Deaths caused by HIV/AIDS", initial: 550000, rate: 0.05, color: "text-red-500" },
      { label: "Deaths caused by cancer", initial: 2800000, rate: 0.3, color: "text-red-500" },
      { label: "Suicides this year", initial: 380000, rate: 0.03, color: "text-slate-400" },
      { label: "Cigarettes smoked today", initial: 8500000000, rate: 20000, isDaily: true, color: "text-slate-300" },
    ],
  },
];

type Country = {
  name: string;
  population: number;
  yearlyChange: number;
  density: number;
  landArea: number;
  fertility: number;
  continent: string;
  flag: string;
};

const COUNTRIES_DATA: Country[] = [
  { name: "China", population: 1425671000, yearlyChange: 0.02, density: 151, landArea: 9388211, fertility: 1.2, continent: "Asia", flag: "🇨🇳" },
  { name: "India", population: 1428627000, yearlyChange: 0.81, density: 481, landArea: 2973190, fertility: 2.0, continent: "Asia", flag: "🇮🇳" },
  { name: "United States", population: 339996000, yearlyChange: 0.5, density: 37, landArea: 9147420, fertility: 1.7, continent: "North America", flag: "🇺🇸" },
  { name: "Indonesia", population: 277534000, yearlyChange: 0.74, density: 153, landArea: 1811570, fertility: 2.2, continent: "Asia", flag: "🇮🇩" },
  { name: "Pakistan", population: 240485000, yearlyChange: 1.98, density: 312, landArea: 770880, fertility: 3.3, continent: "Asia", flag: "🇵🇰" },
  { name: "Nigeria", population: 223804000, yearlyChange: 2.41, density: 246, landArea: 910770, fertility: 5.1, continent: "Africa", flag: "🇳🇬" },
  { name: "Brazil", population: 216422000, yearlyChange: 0.52, density: 26, landArea: 8358140, fertility: 1.6, continent: "Latin America", flag: "🇧🇷" },
  { name: "Bangladesh", population: 172954000, yearlyChange: 1.03, density: 1329, landArea: 130170, fertility: 1.9, continent: "Asia", flag: "🇧🇩" },
  { name: "Russia", population: 144444000, yearlyChange: -0.19, density: 9, landArea: 16376870, fertility: 1.5, continent: "Europe", flag: "🇷🇺" },
  { name: "Mexico", population: 128455000, yearlyChange: 0.75, density: 66, landArea: 1943950, fertility: 1.8, continent: "North America", flag: "🇲🇽" },
  { name: "Ethiopia", population: 126527000, yearlyChange: 2.55, density: 127, landArea: 1000000, fertility: 3.9, continent: "Africa", flag: "🇪🇹" },
  { name: "Japan", population: 123294000, yearlyChange: -0.53, density: 338, landArea: 364555, fertility: 1.3, continent: "Asia", flag: "🇯🇵" },
  { name: "Philippines", population: 117337000, yearlyChange: 1.54, density: 394, landArea: 298170, fertility: 2.5, continent: "Asia", flag: "🇵🇭" },
  { name: "Egypt", population: 112716000, yearlyChange: 1.56, density: 113, landArea: 995450, fertility: 2.9, continent: "Africa", flag: "🇪🇬" },
  { name: "DR Congo", population: 102262000, yearlyChange: 3.29, density: 45, landArea: 2267050, fertility: 5.5, continent: "Africa", flag: "🇨🇩" },
  { name: "Vietnam", population: 98858000, yearlyChange: 0.68, density: 319, landArea: 310070, fertility: 1.9, continent: "Asia", flag: "🇻🇳" },
  { name: "Iran", population: 89172000, yearlyChange: 0.7, density: 55, landArea: 1628550, fertility: 1.7, continent: "Asia", flag: "🇮🇷" },
  { name: "Turkey", population: 85816000, yearlyChange: 0.56, density: 112, landArea: 769630, fertility: 1.9, continent: "Asia", flag: "🇹🇷" },
  { name: "Germany", population: 83294000, yearlyChange: -0.09, density: 239, landArea: 348560, fertility: 1.5, continent: "Europe", flag: "🇩🇪" },
  { name: "Thailand", population: 71801000, yearlyChange: 0.15, density: 141, landArea: 510890, fertility: 1.3, continent: "Asia", flag: "🇹🇭" },
  { name: "United Kingdom", population: 67736000, yearlyChange: 0.34, density: 280, landArea: 241930, fertility: 1.6, continent: "Europe", flag: "🇬🇧" },
  { name: "France", population: 64756000, yearlyChange: 0.2, density: 119, landArea: 547557, fertility: 1.8, continent: "Europe", flag: "🇫🇷" },
  { name: "Italy", population: 58870000, yearlyChange: -0.28, density: 200, landArea: 294140, fertility: 1.2, continent: "Europe", flag: "🇮🇹" },
  { name: "South Africa", population: 60414000, yearlyChange: 0.87, density: 49, landArea: 1213090, fertility: 2.3, continent: "Africa", flag: "🇿🇦" },
];

const CONTINENTS = ["All", "Asia", "Africa", "Europe", "North America", "Latin America", "Oceania"];

// --- Helper Components ---

type CardProps = {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
};

const Card = ({ children, className = "", onClick }: CardProps) => (
  <div onClick={onClick} className={`bg-slate-900 border border-slate-800 rounded-xl shadow-sm overflow-hidden ${className}`}>
    {children}
  </div>
);

type BadgeProps = {
  children: React.ReactNode;
  className?: string;
};

const Badge = ({ children, className = "" }: BadgeProps) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
    {children}
  </span>
);

const LiveIndicator = () => (
  <div className="flex items-center space-x-2">
    <span className="relative flex h-2.5 w-2.5">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
    </span>
    <span className="text-green-400 text-xs font-bold uppercase tracking-wider">Live</span>
  </div>
);

// --- Logic Components ---

type LiveCounterProps = {
  initial: number;
  rate: number;
  isDaily?: boolean;
  format?: "currency" | "standard";
  className?: string;
  main?: boolean;
};

const LiveCounter = ({ initial, rate, format = "standard", className = "", main = false }: LiveCounterProps) => {
  const [count, setCount] = useState(initial);
  const startRef = useRef(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const elapsedSeconds = (now - startRef.current) / 1000;
      setCount(initial + elapsedSeconds * rate);
    }, 50);

    return () => clearInterval(interval);
  }, [initial, rate]);

  const formatted = new Intl.NumberFormat("en-US", {
    style: format === "currency" ? "currency" : "decimal",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Math.floor(count));

  return (
    <span
      className={`font-mono tracking-tight tabular-nums ${className} ${
        main ? "text-5xl md:text-7xl font-bold" : "text-2xl md:text-3xl font-semibold"
      }`}
    >
      {formatted}
    </span>
  );
};

const HeroSection = () => {
  const pop = SECTIONS[0].items[0];
  return (
    <div className="w-full bg-slate-900/50 border-y border-slate-800 py-12 md:py-20 px-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 pointer-events-none"></div>
      <div className="max-w-7xl mx-auto text-center relative z-10">
        <div className="flex justify-center mb-6">
          <Badge className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-4 py-1">Real-time Statistics</Badge>
        </div>
        <h1 className="text-xl md:text-3xl text-slate-400 mb-4 font-light">Current World Population</h1>
        <div className="text-slate-50 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
          <LiveCounter initial={pop.initial} rate={pop.rate} main />
        </div>
        <p className="mt-6 text-slate-500 text-sm max-w-2xl mx-auto">
          Data based on the latest United Nations Population Division estimates and algorithm simulations.
        </p>
      </div>
    </div>
  );
};

type SectionGridProps = {
  section: Section;
};

const SectionGrid = ({ section }: SectionGridProps) => {
  const Icon = section.icon;
  return (
    <div className="mb-12 scroll-mt-24" id={section.id}>
      <div className="flex items-center mb-6 space-x-3">
        <div className={`p-2 rounded-lg bg-slate-900 border border-slate-800 ${section.color}`}>
          <Icon size={24} />
        </div>
        <h2 className="text-2xl font-bold text-slate-100">{section.title}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {section.items.map((item, idx) =>
          section.id === "population" && item.main ? null : (
            <Card
              key={`${section.id}-${idx}`}
              className="bg-slate-950/50 border-slate-800/60 hover:border-slate-700 transition-colors duration-300"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-sm text-slate-500 font-medium h-10 line-clamp-2 w-3/4">{item.label}</h3>
                  {item.isDaily && <Badge className="bg-slate-800 text-slate-400 text-[10px] px-1.5">Today</Badge>}
                </div>
                <div className={`mt-2 ${item.color || "text-slate-200"}`}>
                  <LiveCounter initial={item.initial} rate={item.rate} format={item.format} className="text-3xl" />
                </div>
              </div>
            </Card>
          ),
        )}
      </div>
    </div>
  );
};

// --- Countries Page Components ---

type Tab = "home" | "countries";

type CountryCardProps = {
  country: Country;
  isSelected: boolean;
  onSelect: () => void;
};

const CountryCard = ({ country, isSelected, onSelect }: CountryCardProps) => (
  <div
    onClick={onSelect}
    className={`group cursor-pointer relative p-4 rounded-xl border transition-all duration-200 ${
      isSelected
        ? "bg-blue-500/10 border-blue-500/50 ring-1 ring-blue-500/50"
        : "bg-slate-900 border-slate-800 hover:border-slate-600 hover:shadow-lg hover:-translate-y-1"
    }`}
  >
    <div className="text-3xl mb-3 group-hover:scale-110 transition-transform origin-left duration-200">{country.flag}</div>
    <h3 className="font-semibold text-slate-200 truncate mb-1 group-hover:text-blue-400 transition-colors">
      {country.name}
    </h3>
    <p className="text-xs text-slate-500">Pop: {(country.population / 1000000).toFixed(1)}M</p>
  </div>
);

const CountryDetails = ({ country }: { country: Country }) => (
  <div className="animate-in fade-in slide-in-from-right-4 duration-300">
    <div className="flex items-center space-x-4 mb-8 pb-6 border-b border-slate-800">
      <span className="text-6xl shadow-sm">{country.flag}</span>
      <div>
        <h2 className="text-2xl font-bold text-white">{country.name}</h2>
        <span className="inline-flex items-center text-xs font-medium text-slate-400 bg-slate-900 px-2 py-1 rounded mt-1 border border-slate-800">
          {country.continent}
        </span>
      </div>
    </div>

    <div className="space-y-6">
      <div>
        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Population Live</h4>
        <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800">
          <div className="text-blue-400 text-3xl font-mono font-bold">
            <LiveCounter initial={country.population} rate={(country.population * (country.yearlyChange / 100)) / 31536000} />
          </div>
          <div className="text-xs text-slate-500 mt-1 flex items-center">
            {country.yearlyChange > 0 ? "+" : ""}
            {country.yearlyChange}% yearly change
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Geography</h4>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-slate-900 rounded-lg border border-slate-800/50">
            <span className="text-sm text-slate-400">Land Area</span>
            <span className="text-sm font-medium text-slate-200">{country.landArea.toLocaleString()} km²</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-slate-900 rounded-lg border border-slate-800/50">
            <span className="text-sm text-slate-400">Density</span>
            <span className="text-sm font-medium text-slate-200">{country.density} P/Km²</span>
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Demographics</h4>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-slate-900 rounded-lg border border-slate-800/50">
            <span className="text-sm text-slate-400">Fertility Rate</span>
            <span className="text-sm font-medium text-slate-200">{country.fertility}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const MobileCountryDetails = ({ country, onClose }: { country: Country; onClose: () => void }) => (
  <div className="lg:hidden fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
    <div className="bg-slate-900 w-full max-w-lg rounded-t-2xl sm:rounded-xl border border-slate-800 shadow-2xl max-h-[80vh] overflow-y-auto">
      <div className="sticky top-0 bg-slate-900/95 backdrop-blur border-b border-slate-800 p-4 flex justify-between items-center z-10">
        <h3 className="font-bold text-lg text-white">{country.name} Details</h3>
        <button onClick={onClose} className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white">
          <ChevronRight className="rotate-90" size={20} />
        </button>
      </div>
      <div className="p-6 space-y-6">
        <div className="text-center">
          <span className="text-6xl block mb-2">{country.flag}</span>
          <div className="text-4xl font-mono font-bold text-blue-400">
            <LiveCounter initial={country.population} rate={(country.population * (country.yearlyChange / 100)) / 31536000} />
          </div>
          <p className="text-slate-500 text-sm mt-1">Real-time Population</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-950 p-3 rounded-lg text-center border border-slate-800">
            <div className="text-xs text-slate-500 uppercase">Density</div>
            <div className="font-bold text-slate-200">{country.density}</div>
          </div>
          <div className="bg-slate-950 p-3 rounded-lg text-center border border-slate-800">
            <div className="text-xs text-slate-500 uppercase">Fertility</div>
            <div className="font-bold text-slate-200">{country.fertility}</div>
          </div>
          <div className="bg-slate-950 p-3 rounded-lg text-center border border-slate-800 col-span-2">
            <div className="text-xs text-slate-500 uppercase">Land Area</div>
            <div className="font-bold text-slate-200">{country.landArea.toLocaleString()} km²</div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const CountriesLayout = () => {
  const [selectedContinent, setSelectedContinent] = useState("All");
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);

  const filteredCountries = useMemo(
    () => (selectedContinent === "All" ? COUNTRIES_DATA : COUNTRIES_DATA.filter((c) => c.continent === selectedContinent)),
    [selectedContinent],
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[calc(100vh-64px)]">
      <aside className="lg:col-span-2 bg-slate-950 border-r border-slate-800 p-6 hidden lg:block overflow-y-auto max-h-screen sticky top-16">
        <div className="mb-8">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-2">Regions</h3>
          <nav className="space-y-1">
            {CONTINENTS.map((continent) => (
              <button
                key={continent}
                onClick={() => setSelectedContinent(continent)}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  selectedContinent === continent
                    ? "bg-slate-800 text-white"
                    : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                }`}
              >
                {continent === "All" ? <Globe size={16} className="mr-3" /> : <Map size={16} className="mr-3" />}
                {continent}
              </button>
            ))}
          </nav>
        </div>
      </aside>

      <div className="lg:hidden col-span-1 p-4 border-b border-slate-800 bg-slate-950 sticky top-16 z-30 flex overflow-x-auto gap-2 no-scrollbar">
        {CONTINENTS.map((continent) => (
          <button
            key={continent}
            onClick={() => setSelectedContinent(continent)}
            className={`whitespace-nowrap px-3 py-1 text-sm font-medium rounded-full border ${
              selectedContinent === continent
                ? "bg-blue-600 border-blue-600 text-white"
                : "bg-slate-900 border-slate-700 text-slate-400"
            }`}
          >
            {continent}
          </button>
        ))}
      </div>

      <main className="col-span-1 lg:col-span-7 bg-slate-950 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Countries</h2>
            <p className="text-slate-400 text-sm mt-1">Showing {filteredCountries.length} countries sorted by population</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredCountries.map((country) => (
            <CountryCard
              key={country.name}
              country={country}
              isSelected={selectedCountry?.name === country.name}
              onSelect={() => setSelectedCountry(country)}
            />
          ))}
        </div>
      </main>

      <aside className="lg:col-span-3 bg-slate-950 border-l border-slate-800 p-6 hidden lg:block overflow-y-auto max-h-screen sticky top-16">
        {selectedCountry ? (
          <CountryDetails country={selectedCountry} />
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 opacity-50">
            <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mb-4">
              <Globe className="text-slate-500" size={32} />
            </div>
            <h3 className="text-lg font-medium text-slate-300 mb-2">Select a Country</h3>
            <p className="text-sm text-slate-500">
              Click on any country in the grid to view detailed real-time statistics and geography data.
            </p>
          </div>
        )}
      </aside>

      {selectedCountry && <MobileCountryDetails country={selectedCountry} onClose={() => setSelectedCountry(null)} />}
    </div>
  );
};

// --- Main App Shell ---

const Navbar = ({ activeTab, setActiveTab }: { activeTab: Tab; setActiveTab: (tab: Tab) => void }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab("home")}>
              <div className="bg-gradient-to-br from-blue-600 to-violet-600 p-1.5 rounded-lg">
                <Globe className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-400 hidden sm:block">
                WorldStatsLive
              </span>
            </div>

            <div className="hidden md:flex space-x-1">
              <button
                onClick={() => setActiveTab("home")}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "home" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                World Statistics
              </button>
              <button
                onClick={() => setActiveTab("countries")}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "countries" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                Countries
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400 text-sm">
              <LiveIndicator />
            </div>
            <button className="p-2 text-slate-400 hover:text-white">
              <Search size={20} />
            </button>
            <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2 text-slate-400 hover:text-white">
              <Menu size={24} />
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <button
              onClick={() => {
                setActiveTab("home");
                setIsOpen(false);
              }}
              className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${
                activeTab === "home" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              World Statistics
            </button>
            <button
              onClick={() => {
                setActiveTab("countries");
                setIsOpen(false);
              }}
              className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${
                activeTab === "countries" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              Countries
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

const Footer = () => (
  <footer className="bg-slate-950 border-t border-slate-800 pt-16 pb-8">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
        <div className="col-span-1 md:col-span-2">
          <div className="flex items-center space-x-2 mb-4">
            <div className="bg-slate-800 p-1 rounded">
              <Globe className="h-5 w-5 text-slate-400" />
            </div>
            <span className="text-lg font-bold text-slate-200">WorldStatsLive</span>
          </div>
          <p className="text-slate-500 text-sm leading-relaxed max-w-sm">
            Live world statistics on population, government, economics, society, media, environment, food, water, energy, and
            health. Dedicated to making world statistics available in a thought-provoking and time relevant format.
          </p>
        </div>

        <div>
          <h4 className="text-slate-200 font-semibold mb-4">About</h4>
          <ul className="space-y-2 text-sm text-slate-500">
            <li>
              <a href="#" className="hover:text-blue-400 transition-colors">
                Methodology
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-400 transition-colors">
                Sources
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-400 transition-colors">
                Licensing
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-400 transition-colors">
                Contact
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-slate-200 font-semibold mb-4">Connect</h4>
          <div className="flex space-x-4">
            <a href="#" className="text-slate-500 hover:text-white transition-colors">
              <Twitter size={20} />
            </a>
            <a href="#" className="text-slate-500 hover:text-white transition-colors">
              <Github size={20} />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-900 pt-8 flex flex-col md:flex-row justify-between items-center">
        <p className="text-slate-600 text-sm">© {new Date().getFullYear()} WorldStatsLive Replica. For educational purposes only.</p>
        <div className="flex space-x-6 mt-4 md:mt-0">
          <span className="text-slate-600 text-xs">Privacy Policy</span>
          <span className="text-slate-600 text-xs">Terms of Service</span>
        </div>
      </div>
    </div>
  </footer>
);

const V2 = () => {
  const [activeTab, setActiveTab] = useState<Tab>("home");

  useEffect(() => {
    document.body.style.backgroundColor = "#020617";
    document.body.style.color = "#f8fafc";
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-blue-500/30 flex flex-col">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-grow">
        {activeTab === "home" ? (
          <>
            <HeroSection />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
              {SECTIONS.map((section) => (
                <SectionGrid key={section.id} section={section} />
              ))}
            </div>
          </>
        ) : (
          <CountriesLayout />
        )}
      </main>

      <Footer />
    </div>
  );
};

export default V2;
