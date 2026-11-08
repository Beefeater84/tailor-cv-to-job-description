/** Site key of a URL: the host without `www.`, lowercased. Used for rule files and `examples/index.yaml`. */
export function siteKey(url: URL): string {
  return url.hostname.replace(/^www\./i, "").toLowerCase();
}
