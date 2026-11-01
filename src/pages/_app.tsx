import "../styles/globals.css";
import "@fontsource/philosopher/400.css";
import "@fontsource/philosopher/700.css";
import "@fontsource/open-sans/400.css";
import "@fontsource/open-sans/600.css";
import "@fontsource/open-sans/700.css";
import { ChakraProvider } from "@chakra-ui/react";
import type { AppProps } from "next/app";
import Script from "next/script";
import { Toaster } from "../shared/components/toaster";
import SiteLayout from "../shared/compounds/SiteLayout";
import system from "../theme";

const UMAMI_WEBSITE_ID = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
const UMAMI_SCRIPT_SRC =
  process.env.NEXT_PUBLIC_UMAMI_SCRIPT_SRC ??
  "https://cloud.umami.is/script.js";
const PLAUSIBLE_SCRIPT_SRC =
  process.env.NEXT_PUBLIC_PLAUSIBLE_SCRIPT_SRC ??
  "https://plausible.io/js/pa-_bHA8JlagL4VXKah7abto.js";

const PLAUSIBLE_INIT_SCRIPT = `
  window.plausible = window.plausible || function() {
    (window.plausible.q = window.plausible.q || []).push(arguments);
  };
  window.plausible.init = window.plausible.init || function(options) {
    window.plausible.o = options || {};
  };
  window.plausible.init();
`;

export default function MyApp({ Component, pageProps }: AppProps) {
  const fillViewport = Boolean((Component as any).fillViewport);

  return (
    <>
      {UMAMI_WEBSITE_ID && (
        <Script
          async
          data-website-id={UMAMI_WEBSITE_ID}
          src={UMAMI_SCRIPT_SRC}
          strategy="afterInteractive"
        />
      )}
      {PLAUSIBLE_SCRIPT_SRC && (
        <>
          <Script
            async
            src={PLAUSIBLE_SCRIPT_SRC}
            strategy="afterInteractive"
          />
          <Script id="plausible-init" strategy="afterInteractive">
            {PLAUSIBLE_INIT_SCRIPT}
          </Script>
        </>
      )}
      <Script
        defer
        src="https://static.cloudflareinsights.com/beacon.min.js"
        data-cf-beacon='{"token": "796ca5d926a84b2b8c959e636b6ab0df"}'
      />
      <Script
        data-goatcounter="https://mapequation.goatcounter.com/count"
        async
        src="//gc.zgo.at/count.js"
      />

      <ChakraProvider value={system}>
        <SiteLayout fillViewport={fillViewport}>
          <Component {...pageProps} />
        </SiteLayout>
        <Toaster />
      </ChakraProvider>
    </>
  );
}
