import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const SRC = "src";
const problems: string[] = [];

const entries = (dir: string) => readdirSync(dir);
const isDir = (p: string) => statSync(p).isDirectory();

const SRC_TOP = new Set(["main.tsx", "app", "features", "components", "lib", "tokens"]);
const FEATURE_FILES = new Set(["entrypoint.ts", "index.ts", "feature-map.md", "workspace"]);
const REQUIRED_HEADINGS = ["Sub-features", "How to get to it", "Gotchas", "Verify"];

for (const name of entries(SRC)) {
  if (!SRC_TOP.has(name)) {
    problems.push(`src/${name} is not allowed — src/ holds only main.tsx, app/, features/, components/, lib/, tokens/`);
  }
}

const components = entries(join(SRC, "components")).filter((n) => n !== ".DS_Store");
if (components.length !== 1 || components[0] !== "ui") {
  problems.push(`src/components/ must contain only ui/ — found ${components.join(", ")}`);
}
for (const dir of ["components/ui", "lib"]) {
  for (const name of entries(join(SRC, dir))) {
    if (isDir(join(SRC, dir, name))) {
      problems.push(`src/${dir}/${name} is a folder — src/${dir}/ is flat`);
    }
  }
}

const IMPORT_RE = /from\s+["']([^"']+)["']/g;

const featuresDir = join(SRC, "features");
for (const name of entries(featuresDir)) {
  const path = join(featuresDir, name);
  if (name === "entrypoint.ts" || name === "catalog.ts") {
    if (isDir(path)) problems.push(`${path} must be a file, not a folder`);
    continue;
  }
  if (!isDir(path)) {
    problems.push(`src/features/${name} is not allowed — features/ holds entrypoint.ts, catalog.ts and feature folders`);
    continue;
  }
  for (const item of entries(path)) {
    if (!FEATURE_FILES.has(item)) {
      problems.push(`src/features/${name}/${item} is not allowed — a feature has exactly entrypoint.ts, index.ts, feature-map.md, workspace/`);
    }
  }
  for (const required of FEATURE_FILES) {
    if (!existsSync(join(path, required))) {
      problems.push(`src/features/${name}/${required} is missing`);
    }
  }
  const workspace = join(path, "workspace");
  if (existsSync(workspace) && isDir(workspace)) {
    for (const item of entries(workspace)) {
      if (isDir(join(workspace, item))) {
        problems.push(`src/features/${name}/workspace/${item} is a folder — workspace/ is flat`);
      }
    }
  }
  const mapPath = join(path, "feature-map.md");
  if (existsSync(mapPath)) {
    const map = readFileSync(mapPath, "utf8");
    for (const heading of REQUIRED_HEADINGS) {
      if (!map.includes(`## ${heading}`)) {
        problems.push(`src/features/${name}/feature-map.md is missing the '## ${heading}' section`);
      }
    }
  }
}

const walk = (dir: string): string[] =>
  entries(dir).flatMap((n) => {
    const p = join(dir, n);
    return isDir(p) ? walk(p) : [p];
  });

for (const feature of entries(featuresDir)) {
  const dir = join(featuresDir, feature);
  if (!isDir(dir)) continue;
  for (const file of walk(dir)) {
    if (!/\.tsx?$/.test(file)) continue;
    const text = readFileSync(file, "utf8");
    for (const match of text.matchAll(IMPORT_RE)) {
      const spec = match[1];
      const deep = /^@\/features\/([^/]+)\/(.+)$/.exec(spec);
      if (deep !== null && deep[1] !== feature) {
        problems.push(`${file} imports '${spec}' — another feature is only reachable through its index edge '@/features/<name>'`);
      } else {
        const other = /^@\/features\/([^/]+)$/.exec(spec);
        if (other !== null && other[1] === feature) {
          problems.push(`${file} imports its own index '@/features/${feature}' — use '@/features/${feature}/workspace/<file>' inside the feature`);
        }
      }
    }
  }
}

if (problems.length > 0) {
  for (const problem of problems) console.error(`structure: ${problem}`);
  process.exit(1);
}
console.log("structure: ok");
