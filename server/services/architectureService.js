/**
 * Architecture Service — Mermaid Diagram Generator
 *
 * Generates Mermaid.js diagram syntax from repository structure
 * and detected tech stack.
 */

// ── Layer detection maps ───────────────────────────────────────────────────

const FRONTEND_TECHS = new Set([
  'React', 'Next.js', 'Vue.js', 'Nuxt.js', 'Angular', 'Svelte',
  'SvelteKit', 'Gatsby', 'Remix', 'Astro', 'Solid.js',
]);

const BACKEND_TECHS = new Set([
  'Node.js', 'Express.js', 'Fastify', 'NestJS', 'Koa',
  'Django', 'Flask', 'FastAPI', 'Spring Boot', 'Rails',
  'Laravel', 'ASP.NET',
]);

const DATABASE_TECHS = new Set([
  'MongoDB', 'PostgreSQL', 'MySQL', 'SQLite', 'Redis',
  'Firebase', 'Supabase', 'DynamoDB', 'Cassandra',
  'Elasticsearch', 'Neo4j', 'Prisma',
]);

const DEVOPS_TECHS = new Set([
  'Docker', 'Kubernetes', 'GitHub Actions', 'Jenkins',
  'Terraform', 'AWS', 'Vercel', 'Netlify', 'Heroku',
]);

// ── Folder pattern → layer mapping ─────────────────────────────────────────

const API_FOLDER_PATTERNS = [
  /^(api|routes|endpoints|controllers)/i,
  /\/(api|routes|endpoints|controllers)$/i,
];

const SERVICE_FOLDER_PATTERNS = [
  /^(services|utils|helpers|lib)/i,
  /\/(services|utils|helpers|lib)$/i,
];

const MODEL_FOLDER_PATTERNS = [
  /^(models|schemas|entities)/i,
  /\/(models|schemas|entities)$/i,
];

const COMPONENT_FOLDER_PATTERNS = [
  /^(components|pages|views|screens|layouts)/i,
  /\/(components|pages|views|screens|layouts)$/i,
];

const MIDDLEWARE_FOLDER_PATTERNS = [
  /^(middlewares?|middleware)/i,
  /\/(middlewares?|middleware)$/i,
];

// ── Main generator ─────────────────────────────────────────────────────────

/**
 * Generates Mermaid diagram code from repo data.
 *
 * @param {Object} repoData
 * @param {string} repoData.repoName
 * @param {Object} repoData.techStack
 * @param {string[]} repoData.folders - top-level folder paths
 * @returns {{ diagram: string }}
 */
const generateArchitectureDiagram = (repoData) => {
  const { repoName = 'Project', techStack = {}, folders = [] } = repoData;

  const {
    languages = [],
    frameworks = [],
    backend = [],
    database = [],
    devTools = [],
  } = techStack;

  // Detect layers
  const allTechs = [...frameworks, ...backend, ...database, ...devTools];

  const hasFrontend = allTechs.some((t) => FRONTEND_TECHS.has(t));
  const hasBackend = allTechs.some((t) => BACKEND_TECHS.has(t));
  const hasDatabase = allTechs.some((t) => DATABASE_TECHS.has(t));
  const hasDevOps = allTechs.some((t) => DEVOPS_TECHS.has(t));

  const hasAPI = folders.some((f) => API_FOLDER_PATTERNS.some((p) => p.test(f)));
  const hasServices = folders.some((f) => SERVICE_FOLDER_PATTERNS.some((p) => p.test(f)));
  const hasModels = folders.some((f) => MODEL_FOLDER_PATTERNS.some((p) => p.test(f)));
  const hasComponents = folders.some((f) => COMPONENT_FOLDER_PATTERNS.some((p) => p.test(f)));
  const hasMiddleware = folders.some((f) => MIDDLEWARE_FOLDER_PATTERNS.some((p) => p.test(f)));

  // Build label strings
  const frontendLabel = frameworks.filter((t) => FRONTEND_TECHS.has(t)).join(', ') || 'Frontend';
  const backendLabel = [...backend.filter((t) => BACKEND_TECHS.has(t))].join(', ') || 'Backend';
  const dbLabel = database.filter((t) => DATABASE_TECHS.has(t)).join(', ') || 'Database';
  const devOpsLabel = devTools.filter((t) => DEVOPS_TECHS.has(t)).join(', ') || 'DevOps';

  // ── Build diagram ──
  const nodes = [];
  const edges = [];
  const styles = [];

  // Title
  nodes.push(`graph TD`);

  // Client / User node
  nodes.push(`  User([fa:fa-user User/Browser])`);

  // Frontend
  if (hasFrontend || hasComponents) {
    nodes.push(`  Frontend["fa:fa-desktop ${frontendLabel}"]`);
    edges.push(`  User --> Frontend`);

    if (hasComponents) {
      nodes.push(`  Components["fa:fa-puzzle-piece Components/Pages"]`);
      edges.push(`  Frontend --> Components`);
    }

    if (hasAPI || hasBackend) {
      edges.push(`  Frontend -->|HTTP/REST| API`);
    }

    styles.push(`  style Frontend fill:#61dafb,stroke:#333,color:#000`);
  }

  // API layer
  if (hasAPI || hasBackend) {
    nodes.push(`  API["fa:fa-exchange-alt API Layer / Routes"]`);
    styles.push(`  style API fill:#f0db4f,stroke:#333,color:#000`);

    if (!hasFrontend) {
      edges.push(`  User -->|HTTP/REST| API`);
    }
  }

  // Middleware
  if (hasMiddleware) {
    nodes.push(`  Middleware["fa:fa-shield-alt Middleware"]`);
    if (hasAPI || hasBackend) {
      edges.push(`  API --> Middleware`);
    }
    styles.push(`  style Middleware fill:#ff6b6b,stroke:#333,color:#fff`);
  }

  // Backend / Services
  if (hasBackend || hasServices) {
    nodes.push(`  Backend["fa:fa-server ${backendLabel}"]`);
    if (hasMiddleware) {
      edges.push(`  Middleware --> Backend`);
    } else if (hasAPI) {
      edges.push(`  API --> Backend`);
    }
    styles.push(`  style Backend fill:#68a063,stroke:#333,color:#fff`);
  }

  // Services sublayer
  if (hasServices) {
    nodes.push(`  Services["fa:fa-cogs Business Logic / Services"]`);
    edges.push(`  Backend --> Services`);
    styles.push(`  style Services fill:#9b59b6,stroke:#333,color:#fff`);
  }

  // Models
  if (hasModels) {
    nodes.push(`  Models["fa:fa-database Models / Schemas"]`);
    if (hasServices) {
      edges.push(`  Services --> Models`);
    } else if (hasBackend) {
      edges.push(`  Backend --> Models`);
    }
    styles.push(`  style Models fill:#e67e22,stroke:#333,color:#fff`);
  }

  // Database
  if (hasDatabase) {
    nodes.push(`  Database[("fa:fa-database ${dbLabel}")]`);
    if (hasModels) {
      edges.push(`  Models --> Database`);
    } else if (hasServices) {
      edges.push(`  Services --> Database`);
    } else if (hasBackend) {
      edges.push(`  Backend --> Database`);
    }
    styles.push(`  style Database fill:#4db33d,stroke:#333,color:#fff`);
  }

  // DevOps
  if (hasDevOps) {
    nodes.push(`  DevOps["fa:fa-cloud ${devOpsLabel}"]`);
    // DevOps connects to the main app
    if (hasBackend || hasServices) {
      edges.push(`  DevOps -.->|Deploy| Backend`);
    } else if (hasFrontend) {
      edges.push(`  DevOps -.->|Deploy| Frontend`);
    }
    styles.push(`  style DevOps fill:#2ecc71,stroke:#333,color:#fff`);
  }

  // User node style
  styles.push(`  style User fill:#3498db,stroke:#333,color:#fff`);

  // Fallback if nothing detected
  if (nodes.length <= 2) {
    return {
      diagram: [
        'graph TD',
        `  App["${repoName}"]`,
        `  Lang["Languages: ${languages.join(', ') || 'Unknown'}"]`,
        `  App --> Lang`,
        `  style App fill:#3498db,stroke:#333,color:#fff`,
      ].join('\n'),
    };
  }

  const diagram = [...nodes, '', ...edges, '', ...styles].join('\n');
  return { diagram };
};

module.exports = { generateArchitectureDiagram };
