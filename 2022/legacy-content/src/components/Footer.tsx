
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shuffle } from "lucide-react";

export function Footer() {
  const navigate = useNavigate();
  const pages = [
    "/v1",
    "/v1/dashboards",
    "/v1/country-stats",
    "/v1/dashboards/environment",
    "/v1/dashboards/economy",
    "/v1/dashboards/internet",
    "/v1/dashboards/health",
  ];

  const handleRandomNav = () => {
    const randomIndex = Math.floor(Math.random() * pages.length);
    navigate(pages[randomIndex]);
  };

  return (
    <footer className="sticky bottom-0 z-40 mt-auto w-full border-t bg-background/95 py-6 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:px-8 md:py-0">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
        <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
          Built by{" "}
          <a
            href="https://lovable.dev"
            target="_blank"
            rel="noreferrer"
            className="font-medium underline underline-offset-4"
          >
            Lovable
          </a>
          . The source data is from public APIs.
        </p>
        <Button variant="ghost" onClick={handleRandomNav}>
          <Shuffle className="mr-2 h-4 w-4" />
          Take me somewhere random
        </Button>
      </div>
    </footer>
  );
}
