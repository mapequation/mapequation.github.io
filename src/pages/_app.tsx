import "../styles/globals.css";
import "@fontsource/philosopher/400.css";
import "@fontsource/philosopher/700.css";
import "@fontsource/open-sans/400.css";
import "@fontsource/open-sans/600.css";
import "@fontsource/open-sans/700.css";
import { ChakraProvider } from "@chakra-ui/react";
import type { AppProps } from "next/app";
import Head from "next/head";
import { useRouter } from "next/router";
import Script from "next/script";
import { useEffect } from "react";
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
// GitHub Pages reserves /infomap for the infomap repository, so that repo can
// trampoline direct visits through /?redirect_to=/infomap back into this app.
const REDIRECT_TARGET_PREFIX = "/infomap";

function getRedirectTarget() {
  const target = new URLSearchParams(window.location.search).get("redirect_to");

  if (!target?.startsWith("/") || target.startsWith("//")) {
    return null;
  }

  const url = new URL(target, window.location.origin);

  if (
    url.origin !== window.location.origin ||
    (url.pathname !== REDIRECT_TARGET_PREFIX &&
      !url.pathname.startsWith(`${REDIRECT_TARGET_PREFIX}/`))
  ) {
    return null;
  }

  return `${url.pathname}${url.search}${url.hash}`;
}

export default function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const fillViewport = Boolean((Component as any).fillViewport);

  useEffect(() => {
    if (window.location.pathname !== "/") {
      return;
    }

    const target = getRedirectTarget();

    if (target) {
      void router.replace(target);
    }
  }, [router]);

  return (
    <>
      <Head>
        <title>MapEquation — research, software, and visualizations</title>
      </Head>
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

      <ChakraProvider value={system}>
        <SiteLayout fillViewport={fillViewport}>
          <Component {...pageProps} />
        </SiteLayout>
        <Toaster />
      </ChakraProvider>
    </>
  );
}
