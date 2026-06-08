import { Head, Html, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta name="author" content="" />
        <meta name="theme-color" content="#BFB7AD" />

        <link
          rel="shortcut icon"
          href="https://www.mapequation.org/assets/img/icons/favicon.ico"
        />
        <link
          rel="apple-touch-icon"
          sizes="57x57"
          href="https://www.mapequation.org/assets/img/icons/apple-touch-icon-57.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="72x72"
          href="https://www.mapequation.org/assets/img/icons/apple-touch-icon-72.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="114x114"
          href="https://www.mapequation.org/assets/img/icons/apple-touch-icon-114.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="144x144"
          href="https://www.mapequation.org/assets/img/icons/apple-touch-icon-144.png"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
