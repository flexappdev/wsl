import Script from "next/script";
import { GA_ID, isAnalyticsEnabled } from "@/lib/analytics";

export function GoogleAnalytics() {
  if (!isAnalyticsEnabled()) return null;
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          // Consent Mode v2: denied until the visitor accepts the cookie banner.
          // Read the stored choice here so returning visitors are not reset.
          var c = (document.cookie.match(/(?:^|; )wsl-consent=(\\w+)/) || [])[1];
          var g = c === 'accepted' ? 'granted' : 'denied';
          gtag('consent', 'default', {
            analytics_storage: g,
            ad_storage: g,
            ad_user_data: g,
            ad_personalization: g,
            wait_for_update: 500,
          });
          gtag('js', new Date());
          gtag('config', '${GA_ID}', { send_page_view: true, anonymize_ip: true });
        `}
      </Script>
    </>
  );
}
