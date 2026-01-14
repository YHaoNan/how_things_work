const fs = require('fs');
const path = require('path');

function toPosixPath(p) {
  return p.replace(/\\/g, '/');
}

function isDirectory(p) {
  try {
    return fs.statSync(p).isDirectory();
  } catch {
    return false;
  }
}

function fileExists(p) {
  try {
    return fs.statSync(p).isFile();
  } catch {
    return false;
  }
}

function listProjectCandidates(repoRoot) {
  const candidates = new Map();

  const projectsDir = path.join(repoRoot, 'projects');
  if (isDirectory(projectsDir)) {
    for (const entry of fs.readdirSync(projectsDir, {withFileTypes: true})) {
      if (!entry.isDirectory()) continue;
      const name = entry.name;
      candidates.set(name, path.join(projectsDir, name));
    }
  }

  for (const entry of fs.readdirSync(repoRoot, {withFileTypes: true})) {
    if (!entry.isDirectory()) continue;
    const name = entry.name;
    if (name === 'src' || name === 'agent' || name === 'node_modules' || name === '.git') continue;
    if (name === 'projects' || name === 'scripts') continue;
    if (name.endsWith('_project') || name.includes('project')) {
      candidates.set(name, path.join(repoRoot, name));
    }
  }

  const filtered = [];
  for (const [name, absPath] of candidates.entries()) {
    const hasProgram = fileExists(path.join(absPath, 'program.tsx')) || fileExists(path.join(absPath, 'program.ts'));
    if (hasProgram) filtered.push({name, absPath});
  }

  filtered.sort((a, b) => a.name.localeCompare(b.name));
  return filtered;
}

function resolveProjectAbsPath(repoRoot, projectName) {
  const direct = path.join(repoRoot, projectName);
  if (isDirectory(direct)) return direct;

  const underProjects = path.join(repoRoot, 'projects', projectName);
  if (isDirectory(underProjects)) return underProjects;

  const candidates = listProjectCandidates(repoRoot);
  const byName = candidates.find((c) => c.name === projectName);
  if (byName) return byName.absPath;

  return null;
}

function updateTsconfig(repoRoot, projectAbsPath) {
  const tsconfigPath = path.join(repoRoot, 'tsconfig.json');
  const raw = fs.readFileSync(tsconfigPath, 'utf8');
  const tsconfig = JSON.parse(raw);

  const projectRel = toPosixPath(path.relative(repoRoot, projectAbsPath));

  tsconfig.compilerOptions ??= {};
  tsconfig.compilerOptions.baseUrl ??= '.';
  tsconfig.compilerOptions.paths ??= {};
  tsconfig.compilerOptions.paths['@ws/*'] = [`${projectRel}/*`];

  const candidateRelSet = new Set(
    listProjectCandidates(repoRoot).map((c) => toPosixPath(path.relative(repoRoot, c.absPath))),
  );

  const include = new Set(Array.isArray(tsconfig.include) ? tsconfig.include : []);
  include.add('src');
  for (const entry of Array.from(include)) {
    if (typeof entry === 'string' && (entry === 'projects' || candidateRelSet.has(entry))) {
      include.delete(entry);
    }
  }
  include.add(projectRel);
  tsconfig.include = Array.from(include);

  fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2) + '\n');
  return {projectRel};
}

function replaceViteAlias(content, aliasKey, newRelPath) {
  const normalized = toPosixPath(newRelPath).replace(/^\.\//, '');
  const newAliasPath = `./${normalized}`;
  const re = new RegExp(
    `([\\'\\\"\\\`]${aliasKey}[\\'\\\"\\\`]\\s*:\\s*path\\.resolve\\(__dirname,\\s*[\\'\\\"\\\`])([^\\'\\\"\\\`]+)([\\'\\\"\\\`]\\)\\s*,)`,
    'g',
  );

  const found = re.test(content);
  if (!found) return {found: false, updated: false, content};

  re.lastIndex = 0;
  const next = content.replace(re, `$1${newAliasPath}$3`);
  return {found: true, updated: next !== content, content: next};
}

function updateViteConfig(repoRoot, projectRel) {
  const vitePath = path.join(repoRoot, 'vite.config.ts');
  const before = fs.readFileSync(vitePath, 'utf8');

  let next = before;
  const ws = replaceViteAlias(next, '@ws', projectRel);
  next = ws.content;
  const workspace = replaceViteAlias(next, '@workspace', projectRel);
  next = workspace.content;

  if (!ws.found && !workspace.found) {
    throw new Error('vite.config.ts: 未找到 @ws/@workspace 的 alias 定义，无法自动更新。');
  }

  if (next !== before) fs.writeFileSync(vitePath, next);
}

function printUsage() {
  console.log('用法: npm run cd -- <项目名>');
  console.log('      npm run cd:list');
  console.log('简写: npm run c -- <项目名>');
  console.log('      npm run cl');
}

function main() {
  const repoRoot = path.resolve(__dirname, '..');
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    printUsage();
    process.exit(0);
  }

  if (args.includes('--list')) {
    const candidates = listProjectCandidates(repoRoot);
    if (candidates.length === 0) {
      console.log('未发现可用项目目录（建议放在 projects/<name>，或使用 *_project 目录名）。');
      process.exit(0);
    }
    for (const c of candidates) console.log(c.name);
    process.exit(0);
  }

  const projectName = args[0];
  if (!projectName) {
    printUsage();
    process.exit(1);
  }

  const projectAbsPath = resolveProjectAbsPath(repoRoot, projectName);
  if (!projectAbsPath) {
    const candidates = listProjectCandidates(repoRoot);
    const hint = candidates.length ? `可用: ${candidates.map((c) => c.name).join(', ')}` : '可用: (无)';
    console.error(`未找到项目: ${projectName}\n${hint}`);
    process.exit(1);
  }

  const {projectRel} = updateTsconfig(repoRoot, projectAbsPath);
  updateViteConfig(repoRoot, projectRel);
  console.log(`已切换 @ws -> ${projectRel}`);
}

main();
