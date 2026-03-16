/**
 * Tech Stack Detection Service
 *
 * Analyzes repository languages, file tree, and package.json
 * to detect the technologies used in a project.
 */

// ── Detection rule tables ──────────────────────────────────────────────────────

/** Frontend frameworks detected via dependency names */
const FRONTEND_DEP_RULES = [
  { dep: 'react', name: 'React' },
  { dep: 'react-dom', name: 'React' },
  { dep: 'vue', name: 'Vue.js' },
  { dep: '@angular/core', name: 'Angular' },
  { dep: 'svelte', name: 'Svelte' },
  { dep: 'solid-js', name: 'SolidJS' },
  { dep: 'preact', name: 'Preact' },
  { dep: 'jquery', name: 'jQuery' },
];

/** Frontend meta-frameworks detected via config files in the tree */
const FRONTEND_FILE_RULES = [
  { file: 'next.config.js', name: 'Next.js' },
  { file: 'next.config.mjs', name: 'Next.js' },
  { file: 'next.config.ts', name: 'Next.js' },
  { file: 'nuxt.config.js', name: 'Nuxt.js' },
  { file: 'nuxt.config.ts', name: 'Nuxt.js' },
  { file: 'angular.json', name: 'Angular' },
  { file: 'svelte.config.js', name: 'SvelteKit' },
  { file: 'astro.config.mjs', name: 'Astro' },
  { file: 'gatsby-config.js', name: 'Gatsby' },
  { file: 'remix.config.js', name: 'Remix' },
  { file: 'vite.config.js', name: 'Vite' },
  { file: 'vite.config.ts', name: 'Vite' },
  { file: 'webpack.config.js', name: 'Webpack' },
  { file: 'tailwind.config.js', name: 'Tailwind CSS' },
  { file: 'tailwind.config.ts', name: 'Tailwind CSS' },
];

/** Backend frameworks detected via dependency names */
const BACKEND_DEP_RULES = [
  { dep: 'express', name: 'Express.js' },
  { dep: 'fastify', name: 'Fastify' },
  { dep: 'koa', name: 'Koa' },
  { dep: 'hapi', name: 'Hapi' },
  { dep: '@nestjs/core', name: 'NestJS' },
  { dep: 'next', name: 'Next.js' },
];

/** Backend frameworks / languages detected via files in the tree */
const BACKEND_FILE_RULES = [
  { file: 'requirements.txt', name: 'Python' },
  { file: 'setup.py', name: 'Python' },
  { file: 'Pipfile', name: 'Python' },
  { file: 'pyproject.toml', name: 'Python' },
  { file: 'manage.py', name: 'Django' },
  { file: 'pom.xml', name: 'Java / Spring' },
  { file: 'build.gradle', name: 'Java / Gradle' },
  { file: 'go.mod', name: 'Go' },
  { file: 'Cargo.toml', name: 'Rust' },
  { file: 'Gemfile', name: 'Ruby' },
  { file: 'composer.json', name: 'PHP' },
];

/** Database technologies detected via dependency names */
const DATABASE_DEP_RULES = [
  { dep: 'mongoose', name: 'MongoDB' },
  { dep: 'mongodb', name: 'MongoDB' },
  { dep: 'sequelize', name: 'SQL (Sequelize)' },
  { dep: 'prisma', name: 'Prisma' },
  { dep: '@prisma/client', name: 'Prisma' },
  { dep: 'pg', name: 'PostgreSQL' },
  { dep: 'mysql2', name: 'MySQL' },
  { dep: 'mysql', name: 'MySQL' },
  { dep: 'better-sqlite3', name: 'SQLite' },
  { dep: 'redis', name: 'Redis' },
  { dep: 'ioredis', name: 'Redis' },
  { dep: 'firebase', name: 'Firebase' },
  { dep: 'firebase-admin', name: 'Firebase' },
  { dep: '@supabase/supabase-js', name: 'Supabase' },
  { dep: 'typeorm', name: 'TypeORM' },
];

/** Lock files → package manager mapping */
const PACKAGE_MANAGER_RULES = [
  { file: 'pnpm-lock.yaml', name: 'pnpm' },
  { file: 'yarn.lock', name: 'yarn' },
  { file: 'package-lock.json', name: 'npm' },
  { file: 'bun.lockb', name: 'bun' },
];

/** DevOps / tooling detected from file tree */
const DEVOPS_FILE_RULES = [
  { file: 'Dockerfile', name: 'Docker' },
  { file: 'docker-compose.yml', name: 'Docker Compose' },
  { file: 'docker-compose.yaml', name: 'Docker Compose' },
  { file: '.github/workflows', name: 'GitHub Actions' },
  { file: 'vercel.json', name: 'Vercel' },
  { file: 'netlify.toml', name: 'Netlify' },
  { file: '.eslintrc.js', name: 'ESLint' },
  { file: '.eslintrc.json', name: 'ESLint' },
  { file: '.prettierrc', name: 'Prettier' },
  { file: 'jest.config.js', name: 'Jest' },
  { file: 'jest.config.ts', name: 'Jest' },
  { file: 'vitest.config.ts', name: 'Vitest' },
  { file: '.env', name: 'dotenv' },
  { file: 'tsconfig.json', name: 'TypeScript' },
];

// ── Helpers ────────────────────────────────────────────────────────────────────

/**
 * Collects all dependency names from a package.json object
 * (merges dependencies + devDependencies).
 */
const getDepsFromPackageJson = (packageJson) => {
  if (!packageJson || typeof packageJson !== 'object') return [];
  return [
    ...Object.keys(packageJson.dependencies || {}),
    ...Object.keys(packageJson.devDependencies || {}),
  ];
};

/**
 * Builds a Set of *base file names* and a Set of *full paths* from the tree
 * for fast lookups.
 */
const indexTree = (fileTree) => {
  const basenames = new Set();
  const fullPaths = new Set();

  if (!Array.isArray(fileTree)) return { basenames, fullPaths };

  for (const item of fileTree) {
    if (!item.path) continue;
    fullPaths.add(item.path);
    const parts = item.path.split('/');
    basenames.add(parts[parts.length - 1]);
  }

  return { basenames, fullPaths };
};

/**
 * Matches dependency-based rules against a list of dependency names.
 * Returns deduplicated array of detected technology names.
 */
const matchDeps = (rules, deps) => {
  const depsSet = new Set(deps);
  const found = new Set();
  for (const rule of rules) {
    if (depsSet.has(rule.dep)) found.add(rule.name);
  }
  return [...found];
};

/**
 * Matches file-based rules against tree basenames, full paths, and path prefixes.
 * Supports directory-style rules (e.g. `.github/workflows`) by checking if any
 * full path starts with the rule file as a directory prefix.
 * Returns deduplicated array of detected technology names.
 */
const matchFiles = (rules, basenames, fullPaths) => {
  const found = new Set();
  const pathsArray = [...fullPaths];
  for (const rule of rules) {
    if (basenames.has(rule.file) || fullPaths.has(rule.file)) {
      found.add(rule.name);
    } else if (rule.file.includes('/')) {
      // Directory-prefix match: e.g. ".github/workflows" matches ".github/workflows/ci.yml"
      const prefix = rule.file.endsWith('/') ? rule.file : rule.file + '/';
      if (pathsArray.some((p) => p.startsWith(prefix))) {
        found.add(rule.name);
      }
    }
  }
  return [...found];
};

// ── Main detection function ────────────────────────────────────────────────────

/**
 * Detects the tech stack of a repository.
 *
 * @param {Object}   languages    – GitHub languages object, e.g. { JavaScript: 80000 }
 * @param {Array}    fileTree     – Flat array of { path, type, size } objects
 * @param {Object|null} packageJson – Parsed package.json content (may be null)
 * @returns {{ languages: string[], frameworks: string[], backend: string[],
 *             database: string[], packageManager: string, devTools: string[] }}
 */
const detectTechStack = (languages = {}, fileTree = [], packageJson = null) => {
  const deps = getDepsFromPackageJson(packageJson);
  const { basenames, fullPaths } = indexTree(fileTree);

  // 1. Languages — keys from the GitHub languages API
  const detectedLanguages = Object.keys(languages);

  // 2. Frontend frameworks
  const frameworks = [
    ...matchDeps(FRONTEND_DEP_RULES, deps),
    ...matchFiles(FRONTEND_FILE_RULES, basenames, fullPaths),
  ];

  // 3. Backend frameworks
  const backend = [
    ...matchDeps(BACKEND_DEP_RULES, deps),
    ...matchFiles(BACKEND_FILE_RULES, basenames, fullPaths),
  ];

  // Add Node.js if a package.json exists and backend deps are present
  if (basenames.has('package.json') && backend.length > 0) {
    backend.unshift('Node.js');
  }

  // 4. Database
  const database = matchDeps(DATABASE_DEP_RULES, deps);

  // 5. Package manager
  let packageManager = 'Unknown';
  for (const rule of PACKAGE_MANAGER_RULES) {
    if (basenames.has(rule.file)) {
      packageManager = rule.name;
      break; // first match wins (rules ordered by priority)
    }
  }

  // 6. DevOps / tooling
  const devTools = matchFiles(DEVOPS_FILE_RULES, basenames, fullPaths);

  // Deduplicate arrays
  const unique = (arr) => [...new Set(arr)];

  return {
    languages: unique(detectedLanguages),
    frameworks: unique(frameworks),
    backend: unique(backend),
    database: unique(database),
    packageManager,
    devTools: unique(devTools),
  };
};

module.exports = { detectTechStack };
