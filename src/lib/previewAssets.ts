/**
 * Decide which project scripts are safe to inline into the browser preview.
 * Node server files (Express routes, seed data) must stay out of the iframe.
 */
export function shouldInjectBrowserScript(name: string, allFiles: Record<string, string>): boolean {
  if (!/\.(js|mjs|cjs|ts)$/.test(name)) return false;

  if (name.includes("/")) {
    return name.startsWith("client/") || name.includes("/client/") || name.startsWith("src/");
  }

  const fullPaths = Object.keys(allFiles).filter((key) => key !== name && key.endsWith(`/${name}`));
  if (fullPaths.length === 0) return true;

  return fullPaths.some(
    (key) => key.startsWith("client/") || key.includes("/client/") || key.startsWith("src/"),
  );
}
