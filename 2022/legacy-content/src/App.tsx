
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboards from "./pages/Dashboards";
import CountryStats from "./pages/CountryStats";
import V2 from "./pages/V2";
import NotFound from "./pages/NotFound";
import { Layout } from "@/components/Layout";
import { ThemeProvider } from "./components/ThemeProvider";
import EnvironmentDashboard from "./pages/dashboards/Environment";
import EconomyDashboard from "./pages/dashboards/Economy";
import InternetDashboard from "./pages/dashboards/Internet";
import HealthDashboard from "./pages/dashboards/Health";

const queryClient = new QueryClient();
const basename = (import.meta.env.BASE_URL ?? "/").replace(/\/$/, "") || "/";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter basename={basename}>
          <Routes>
            <Route path="/" element={<V2 />} />
            <Route path="/v2" element={<V2 />} />
            <Route path="/v1" element={<Layout />}>
              <Route index element={<Index />} />
              <Route path="dashboards" element={<Dashboards />} />
              <Route path="dashboards/environment" element={<EnvironmentDashboard />} />
              <Route path="dashboards/economy" element={<EconomyDashboard />} />
              <Route path="dashboards/internet" element={<InternetDashboard />} />
              <Route path="dashboards/health" element={<HealthDashboard />} />
              <Route path="country-stats" element={<CountryStats />} />
            </Route>
            <Route element={<Layout />}>
              <Route path="/index" element={<Index />} />
              <Route path="/dashboards" element={<Dashboards />} />
              <Route path="/dashboards/environment" element={<EnvironmentDashboard />} />
              <Route path="/dashboards/economy" element={<EconomyDashboard />} />
              <Route path="/dashboards/internet" element={<InternetDashboard />} />
              <Route path="/dashboards/health" element={<HealthDashboard />} />
              <Route path="/country-stats" element={<CountryStats />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
