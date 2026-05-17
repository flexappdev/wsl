
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import CountUp from 'react-countup';

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  subtitle: string;
  prefix?: string;
  suffix?: string;
}

export function StatCard({ title, value, icon: Icon, subtitle, prefix, suffix }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          <CountUp
            start={0}
            end={value}
            duration={2.75}
            separator=","
            prefix={prefix}
            suffix={suffix}
          />
        </div>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </CardContent>
    </Card>
  );
}
