/**
 * AI Service — Codebase Explanation Generator
 *
 * Uses OpenAI GPT to analyse repository data and produce a structured,
 * developer-friendly explanation.  Falls back to a deterministic mock
 * response when no OPENAI_API_KEY is configured.
 */

const OpenAI = require('openai');

// ── OpenAI client (lazy – only created when an API key exists) ─────────────

let openai = null;

const getClient = () => {
  if (!openai && process.env.OPENAI_API_KEY) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openai;
};

// ── Prompt builder ─────────────────────────────────────────────────────────

/**
 * Builds a compact prompt from repository data.
 * Only the first 20 "important" folders/files are included to stay
 * well within token limits.
 */
const buildPrompt = (repoData) => {
  const {
    name = 'Unknown',
    fullName = '',
    description: rawDescription,
    languages = [],
    frameworks = [],
    backend = [],
    database = [],
    packageManager = 'Unknown',
    devTools = [],
    treeSummary = [],
  } = repoData;

  const description = rawDescription || 'No description provided';

  return `Analyze the following GitHub repository information and explain the project in a developer-friendly way.

Repository: ${fullName || name}
Description: ${description}

Languages: ${languages.length > 0 ? languages.join(', ') : 'Not detected'}
Frontend / Frameworks: ${frameworks.length > 0 ? frameworks.join(', ') : 'None detected'}
Backend: ${backend.length > 0 ? backend.join(', ') : 'None detected'}
Database: ${database.length > 0 ? database.join(', ') : 'None detected'}
Package Manager: ${packageManager}
DevOps / Tooling: ${devTools.length > 0 ? devTools.join(', ') : 'None detected'}

Important files and folders:
${treeSummary.map((p) => `- ${p}`).join('\n')}

Generate the following four sections. Use clear, concise language suitable for a developer who has never seen this project before. Return ONLY valid JSON with these exact keys:

{
  "overview": "A 2-3 paragraph project overview explaining what the project does, its purpose, and target audience.",
  "architecture": "A 2-3 paragraph explanation of the project architecture — how code is organized, which patterns are used, and how the major layers interact.",
  "components": "A 2-3 paragraph description of the key components / modules, what each one does, and how they relate to each other.",
  "setup": "Step-by-step setup instructions a new developer would follow to clone, install, and run the project locally."
}`;
};

// ── Tree summariser ────────────────────────────────────────────────────────

/**
 * Extracts the 20 most "important" paths from a flat file tree.
 * Prioritises config files, top-level directories, and src/ paths.
 */
const summariseTree = (tree = []) => {
  if (!Array.isArray(tree) || tree.length === 0) return [];

  const PRIORITY_FILES = new Set([
    'package.json', 'tsconfig.json', 'README.md', 'Dockerfile',
    '.env', '.env.example', 'docker-compose.yml',
    'next.config.js', 'vite.config.js', 'webpack.config.js',
    'requirements.txt', 'go.mod', 'Cargo.toml', 'pom.xml',
  ]);

  const scored = tree.map((item) => {
    const depth = item.path.split('/').length;
    let score = 0;

    // Top-level items score highest
    if (depth === 1) score += 10;
    else if (depth === 2) score += 5;

    // Config / entry files
    const basename = item.path.split('/').pop();
    if (PRIORITY_FILES.has(basename)) score += 15;

    // Directories are more informative than blobs
    if (item.type === 'tree') score += 3;

    // src-like paths
    if (/^(src|lib|app|server|client|api|pages|components)/i.test(item.path)) {
      score += 4;
    }

    return { path: item.path, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 20).map((s) => s.path);
};

// ── Mock response generator ───────────────────────────────────────────────

/**
 * Produces a deterministic, context-aware mock explanation when no
 * OpenAI API key is available.
 */
const generateMockExplanation = (repoData) => {
  const {
    name = 'this project',
    description: rawDesc,
    languages = [],
    frameworks = [],
    backend = [],
    database = [],
    packageManager = 'Unknown',
    devTools = [],
    treeSummary = [],
  } = repoData;

  const description = rawDesc || 'a software project';

  const langStr = languages.length > 0 ? languages.join(', ') : 'multiple languages';
  const fwStr = frameworks.length > 0 ? frameworks.join(', ') : 'modern frameworks';
  const beStr = backend.length > 0 ? backend.join(', ') : 'a backend runtime';
  const dbStr = database.length > 0 ? database.join(', ') : 'a data store';

  // Infer directory structure description
  const hasSrc = treeSummary.some((p) => p.startsWith('src'));
  const hasServer = treeSummary.some((p) => /^server/i.test(p));
  const hasClient = treeSummary.some((p) => /^client/i.test(p));
  const structureHint = hasServer && hasClient
    ? 'a separated client/server monorepo'
    : hasSrc
      ? 'a standard src-based layout'
      : 'a conventional project layout';

  return {
    overview: `**${name}** is ${description}. The project is built primarily with ${langStr} and leverages ${fwStr} to deliver its functionality.\n\nIt targets developers and end-users who need ${description.toLowerCase().includes('library') ? 'a reusable library' : 'a full-featured application'} in the ${langStr} ecosystem. The repository is actively maintained and follows modern development practices.`,

    architecture: `The project follows ${structureHint} with clear separation of concerns. ${frameworks.length > 0 ? `On the frontend, ${frameworks.join(' and ')} ${frameworks.length > 1 ? 'are' : 'is'} used to build the user interface.` : ''} ${backend.length > 0 ? `The backend is powered by ${beStr}, handling API routes, business logic, and data access.` : ''}\n\n${database.length > 0 ? `Data persistence is managed through ${dbStr}.` : 'The project uses a suitable data persistence strategy.'} ${devTools.length > 0 ? `The development workflow is supported by ${devTools.join(', ')}.` : ''} Configuration files at the root level control build, linting, and deployment settings.`,

    components: `The key components of ${name} include:\n\n${frameworks.length > 0 ? `• **Frontend layer** — Built with ${frameworks.join(', ')}, responsible for rendering the UI, managing client-side state, and communicating with the backend API.\n` : ''}${backend.length > 0 ? `• **Backend layer** — Powered by ${backend.join(', ')}, provides RESTful API endpoints, authentication, and business logic.\n` : ''}${database.length > 0 ? `• **Data layer** — Uses ${database.join(', ')} for data persistence and retrieval.\n` : ''}• **Configuration & tooling** — ${packageManager !== 'Unknown' ? `Managed with ${packageManager}` : 'Standard package management'}${devTools.length > 0 ? `, with ${devTools.join(', ')} for development workflow` : ''}.`,

    setup: `To get started with **${name}** locally:\n\n1. **Clone the repository**\n   \`\`\`bash\n   git clone https://github.com/${repoData.fullName || name}.git\n   cd ${name}\n   \`\`\`\n\n2. **Install dependencies**\n   \`\`\`bash\n   ${packageManager !== 'Unknown' ? packageManager : 'npm'} install\n   \`\`\`\n\n3. **Configure environment**\n   Copy \`.env.example\` to \`.env\` and fill in the required values.\n\n4. **Start the development server**\n   \`\`\`bash\n   ${packageManager !== 'Unknown' ? packageManager : 'npm'} run dev\n   \`\`\`\n\n5. Open your browser and navigate to the URL shown in the terminal (typically \`http://localhost:3000\` or \`http://localhost:5173\`).`,

    _mock: true,
  };
};

// ── Main function ──────────────────────────────────────────────────────────

/**
 * Generates a structured codebase explanation.
 *
 * @param {Object} repoData – merged metadata, tech stack, and tree summary
 * @returns {Promise<{ overview, architecture, components, setup, _mock? }>}
 */
const generateCodebaseExplanation = async (repoData) => {
  const treeSummary = summariseTree(repoData.tree);
  const enriched = { ...repoData, treeSummary };

  const client = getClient();

  // ── If no API key, return mock ──
  if (!client) {
    if (process.env.NODE_ENV !== 'production') console.log('[aiService] No OPENAI_API_KEY found — returning mock explanation');
    return generateMockExplanation(enriched);
  }

  // ── Call OpenAI ──
  const prompt = buildPrompt(enriched);

  try {
    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are an expert software architect. Analyze repository information and return a JSON object with keys: overview, architecture, components, setup. No markdown fences, just raw JSON.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.4,
      max_tokens: 2000,
      response_format: { type: 'json_object' },
    });

    const raw = completion.choices[0]?.message?.content;

    try {
      return JSON.parse(raw);
    } catch {
      return {
        overview: raw || 'Unable to parse AI response.',
        architecture: '',
        components: '',
        setup: '',
      };
    }
  } catch (apiError) {
    if (process.env.NODE_ENV !== 'production') console.error('[aiService] OpenAI API error — falling back to mock:', apiError.message);
    return generateMockExplanation(enriched);
  }
};

module.exports = { generateCodebaseExplanation, summariseTree };
