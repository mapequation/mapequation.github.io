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
  if (path.startsWith("https://") || path.startsWith("http://")) {
    return path;
  }

  return `${SITE_ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;
}

function canonicalUrl(path: string) {
  if (path === "/") return `${SITE_ORIGIN}/`;

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return absoluteUrl(
    normalizedPath.endsWith("/") ? normalizedPath : `${normalizedPath}/`,
  );
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
  const imageType = image.endsWith(".svg") ? "image/svg+xml" : "image/png";

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
