
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaf, LandPlot, Wifi, HeartPulse } from "lucide-react";
import type { ElementType } from "react";

const dashboardItems = [
  {
    title: "Environment",
    description: "CO₂, climate change, and more.",
    icon: Leaf,
    href: "/v1/dashboards/environment",
  },
  {
    title: "Economy",
    description: "GDP, trade, and market data.",
    icon: LandPlot,
    href: "/v1/dashboards/economy",
  },
  {
    title: "Internet",
    description: "Connectivity, users, and speed.",
    icon: Wifi,
    href: "/v1/dashboards/internet",
  },
  {
    title: "Health",
    description: "Life expectancy and wellness stats.",
    icon: HeartPulse,
    href: "/v1/dashboards/health",
  },
];

const Dashboards = () => {
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold">Dashboards</h1>
      <p className="text-muted-foreground mb-8">Themed dashboards with live data are coming soon. Select a category to explore.</p>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        {dashboardItems.map((item) => (
          <DashboardCard key={item.title} {...item} />
        ))}
      </div>
    </div>
  );
};

const DashboardCard = ({ title, icon: Icon, description, href }: { title: string; icon: ElementType; description:string; href: string }) => (
  <Link to={href} className="flex">
    <Card className="text-center hover:shadow-lg transition-shadow w-full">
      <CardHeader>
        <div className="mx-auto bg-primary/10 text-primary p-3 rounded-full w-fit">
          <Icon className="h-8 w-8" />
        </div>
        <CardTitle className="mt-4">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  </Link>
);

export default Dashboards;
