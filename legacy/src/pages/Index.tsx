
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, BarChart, Cpu, Globe, HeartPulse } from "lucide-react";
import { Link } from "react-router-dom";
import type { ElementType } from "react";

const Index = () => {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative w-full py-20 md:py-32 lg:py-40">
        <div className="absolute inset-0 grid-pattern opacity-50"></div>
        <div className="container relative text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-6xl">
            See the World in Real Time
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Explore live, dynamic, and educational statistics about our planet and its people. From population growth to internet penetration, discover the trends shaping our world.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button asChild size="lg">
              <Link to="/v1/dashboards">
                Explore Dashboards <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/v1/country-stats">View by Country</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Live Stats Section */}
      <section className="container py-12">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="World Population"
            value={8123456789}
            icon={Globe}
            subtitle="Growing every second"
          />
          <StatCard
            title="CO₂ Emissions"
            value={421.75}
            suffix=" ppm"
            icon={BarChart}
            subtitle="Atmospheric concentration"
          />
          <StatCard
            title="Internet Users"
            value={5478901234}
            icon={Cpu}
            subtitle="Connected globally"
          />
           <StatCard
            title="Energy Production"
            value={178010}
            suffix=" TWh"
            icon={HeartPulse}
            subtitle="Annual global generation"
          />
        </div>
      </section>

      {/* Category Previews Section */}
      <section className="container py-12 md:py-20">
        <h2 className="text-3xl font-bold text-center">Explore by Category</h2>
        <p className="text-muted-foreground text-center mt-2 mb-8">Dive deeper into specific topics shaping our world.</p>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <CategoryCard title="Demographics" icon={Globe} description="Population, growth, and migration." />
          <CategoryCard title="Economy" icon={BarChart} description="GDP, trade, and economic indicators." />
          <CategoryCard title="Technology" icon={Cpu} description="Internet access, tech adoption, and digital trends." />
          <CategoryCard title="Health" icon={HeartPulse} description="Life expectancy, healthcare access, and wellness." />
        </div>
      </section>
    </div>
  );
};

const CategoryCard = ({ title, icon: Icon, description }: { title: string; icon: ElementType; description: string; }) => (
  <Card className="text-center hover:shadow-lg transition-shadow">
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
)

export default Index;
