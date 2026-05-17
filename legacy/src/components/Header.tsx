
import { Link, NavLink } from "react-router-dom";
import { Globe } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link to="/v1" className="mr-6 flex items-center space-x-2">
          <Globe className="h-6 w-6 text-primary" />
          <span className="font-bold">World Stats Live</span>
        </Link>
        <nav className="flex flex-1 items-center space-x-6 text-sm font-medium">
          <NavLink to="/v1" className={({ isActive }) =>
            `transition-colors hover:text-primary ${isActive ? "text-primary" : "text-muted-foreground"}`
          }>
            Home
          </NavLink>
          <NavLink to="/v1/dashboards" className={({ isActive }) =>
            `transition-colors hover:text-primary ${isActive ? "text-primary" : "text-muted-foreground"}`
          }>
            Dashboards
          </NavLink>
          <NavLink to="/v1/country-stats" className={({ isActive }) =>
            `transition-colors hover:text-primary ${isActive ? "text-primary" : "text-muted-foreground"}`
          }>
            Country Stats
          </NavLink>
          <NavLink to="/" className={({ isActive }) =>
            `transition-colors hover:text-primary ${isActive ? "text-primary" : "text-muted-foreground"}`
          }>
            WSL v2 (Default)
          </NavLink>
        </nav>
        <ThemeToggle />
      </div>
    </header>
  );
}
