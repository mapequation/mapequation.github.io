import Head from "next/head";

const SITE_ORIGIN = "https://www.mapequation.org";
const SITE_NAME = "MapEquation";
const DEFAULT_IMAGE = "/assets/img/icons/apple-touch-icon-144.png";

type SeoType = "website" | "article";

type SeoHeadProps = {
  description: string;
  image?: string;
  path: string;
  title: string;
  type?: SeoType;
};

function absoluteUrl(path: string) {
  return new URL(path, SITE_ORIGIN).toString();
}

function canonicalUrl(path: string) {
  const url = new URL(path, SITE_ORIGIN);

  url.hash = "";
  url.search = "";

  if (url.pathname !== "/" && !url.pathname.endsWith("/")) {
    url.pathname = `${url.pathname}/`;
  }

  return url.toString();
}

function imageMimeType(image: string) {
  const pathname = new URL(image, SITE_ORIGIN).pathname.toLowerCase();
  const extension = pathname.split(".").pop();

  switch (extension) {
    case "gif":
      return "image/gif";
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "svg":
      return "image/svg+xml";
    case "webp":
      return "image/webp";
    default:
      return "image/png";
  }
}

export function SeoHead({
  description,
  image = DEFAULT_IMAGE,
  path,
  title,
  type = "website",
}: SeoHeadProps) {
  const canonical = canonicalUrl(path);
  const imageUrl = absoluteUrl(image);
  const imageType = imageMimeType(image);

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />

      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonical} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:type" content={imageType} />
      <meta property="og:image:alt" content={SITE_NAME} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
    </Head>
  );
}
