import { infomapVersion } from "../infomapVersion";

const SITE_ORIGIN = "https://www.mapequation.org";

// Stable identifier so the Organization can be referenced (by @id) from
// schemas on other pages instead of being duplicated.
export const ORGANIZATION_ID = `${SITE_ORIGIN}/#organization`;

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": ORGANIZATION_ID,
  name: "MapEquation",
  url: `${SITE_ORIGIN}/`,
  logo: `${SITE_ORIGIN}/assets/img/icons/apple-touch-icon-144.png`,
  description:
    "MapEquation is the home of the map equation framework and Infomap, software for flow-based community detection in complex networks.",
  sameAs: ["https://github.com/mapequation"],
};

export const infomapSoftwareSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Infomap",
  url: `${SITE_ORIGIN}/infomap/`,
  description:
    "Software for flow-based community detection in directed, weighted, multilayer, bipartite, and memory networks.",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Windows, macOS, Linux",
  softwareVersion: infomapVersion,
  downloadUrl: `${SITE_ORIGIN}/infomap/install/`,
  softwareHelp: `${SITE_ORIGIN}/infomap/`,
  license: "https://www.gnu.org/licenses/gpl-3.0.html",
  isAccessibleForFree: true,
  offers: {
    "@type": "Offer",
    price: 0,
    priceCurrency: "USD",
  },
  author: { "@id": ORGANIZATION_ID },
  publisher: { "@id": ORGANIZATION_ID },
  sameAs: [
    "https://github.com/mapequation/infomap",
    "https://pypi.org/project/infomap/",
    "https://www.npmjs.com/package/@mapequation/infomap",
    "https://mapequation.r-universe.dev/infomap",
  ],
};
