// The Infomap Python docs moved to their own GitHub Pages site, so retired
// /infomap/python/* links go there instead of to this site's 404 page.
const PYTHON_DOCS_PREFIX = "/infomap/python";
const PYTHON_DOCS_TARGET = "/infomap-python-docs/";

export function getLegacyRedirect(pathname: string) {
  if (
    pathname === PYTHON_DOCS_PREFIX ||
    pathname.startsWith(`${PYTHON_DOCS_PREFIX}/`)
  ) {
    return PYTHON_DOCS_TARGET;
  }

  return null;
}
