import type { DiffFile, Surface, SurfaceGroup } from "./types.js";

const generatedPatterns = [
  /(^|\/)dist\//,
  /(^|\/)build\//,
  /(^|\/)coverage\//,
  /\.min\.(js|css)$/,
  /(^|\/)generated\//
];

export function classifySurface(path: string): Surface {
  const normalized = path.toLowerCase();

  if (generatedPatterns.some((pattern) => pattern.test(normalized))) {
    return "generated";
  }

  if (/(^|\/)(__tests__|test|tests|spec)\//.test(normalized) || /\.(test|spec)\.[cm]?[jt]sx?$/.test(normalized)) {
    return "tests";
  }

  if (/(^|\/)(fixtures?|snapshots?|__fixtures__)\//.test(normalized) || /\.snap$/.test(normalized)) {
    return "fixtures";
  }

  if (/(^|\/)(docs?|readme|changelog|roadmap|contributing|security|code_of_conduct)/.test(normalized) || /\.(md|mdx|rst|txt)$/.test(normalized)) {
    return "docs";
  }

  if (/(^|\/)\.github\//.test(normalized) || /(^|\/)(circleci|buildkite|jenkinsfile)/.test(normalized)) {
    return "ci";
  }

  if (/(^|\/)(package(-lock)?|pnpm-lock|yarn\.lock|bun\.lock)\.(json|yaml|yml)?$/.test(normalized)) {
    return "package";
  }

  if (/(^|\/)(tsconfig|eslint|prettier|biome|vite|webpack|rollup|jest|vitest|releasebox|dependabot)/.test(normalized) || /\.(json|ya?ml|toml|ini)$/.test(normalized)) {
    return "config";
  }

  if (/\.(ts|tsx|js|jsx|mjs|cjs|go|rs|py|rb|java|kt|swift|php|cs|c|cpp|h|hpp)$/.test(normalized)) {
    return "source";
  }

  return "unknown";
}

export function groupBySurface(files: readonly DiffFile[]): SurfaceGroup[] {
  const groups = new Map<Surface, DiffFile[]>();

  for (const file of files) {
    const surface = classifySurface(file.path);
    const existing = groups.get(surface) ?? [];
    existing.push(file);
    groups.set(surface, existing);
  }

  return [...groups.entries()]
    .sort(([left], [right]) => surfaceOrder(left) - surfaceOrder(right))
    .map(([surface, groupedFiles]) => ({ surface, files: groupedFiles }));
}

function surfaceOrder(surface: Surface): number {
  return [
    "source",
    "tests",
    "fixtures",
    "package",
    "config",
    "ci",
    "docs",
    "generated",
    "unknown"
  ].indexOf(surface);
}
