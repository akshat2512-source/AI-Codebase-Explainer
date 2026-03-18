/**
 * Chat Service — AI Repository Q&A
 *
 * Answers user questions about a repository using OpenAI (with mock fallback).
 */

const OpenAI = require('openai');

let openai = null;
const getClient = () => {
  if (!openai && process.env.OPENAI_API_KEY) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openai;
};

/**
 * Build a context string from repository data.
 */
const buildRepoContext = (repoContext) => {
  const {
    repoName = 'Unknown',
    description = '',
    languages = [],
    frameworks = [],
    backend = [],
    database = [],
    devTools = [],
    folders = [],
    aiSummary = '',
  } = repoContext;

  return `Repository: ${repoName}
Description: ${description || 'No description'}
Languages: ${languages.join(', ') || 'Unknown'}
Frontend Frameworks: ${frameworks.join(', ') || 'None'}
Backend: ${backend.join(', ') || 'None'}
Database: ${database.join(', ') || 'None'}
DevOps: ${devTools.join(', ') || 'None'}
Key Folders: ${folders.slice(0, 15).join(', ') || 'Unknown'}
${aiSummary ? `\nProject Summary:\n${aiSummary}` : ''}`;
};

/**
 * Generate a mock answer based on the question and context.
 */
const generateMockAnswer = (question, repoContext) => {
  const q = question.toLowerCase();
  const {
    repoName = 'this project',
    frameworks = [],
    backend = [],
    database = [],
    languages = [],
  } = repoContext;

  if (q.includes('auth') || q.includes('login') || q.includes('jwt')) {
    return `Based on the repository structure, **${repoName}** likely implements authentication using ${backend.length > 0 ? backend.join('/') : 'a backend framework'}. Look for files like \`authController.js\`, \`authMiddleware.js\`, or \`auth.js\` in the controllers/middlewares directories. JWT tokens are commonly used in this stack for stateless authentication.`;
  }

  if (q.includes('database') || q.includes('data') || q.includes('model')) {
    return `**${repoName}** uses ${database.length > 0 ? database.join(', ') : 'a database'} for data persistence. Check the \`models/\` directory for schema definitions. ${database.includes('MongoDB') ? 'Mongoose is likely used as the ODM for MongoDB.' : ''}`;
  }

  if (q.includes('frontend') || q.includes('ui') || q.includes('component')) {
    return `The frontend of **${repoName}** is built with ${frameworks.length > 0 ? frameworks.join(', ') : 'a modern framework'}. Components are organized in the \`src/components/\` directory, with page-level components in \`src/pages/\`. ${frameworks.includes('React') ? 'React hooks and functional components are the standard pattern.' : ''}`;
  }

  if (q.includes('deploy') || q.includes('devops') || q.includes('docker')) {
    return `For deployment, check for \`Dockerfile\`, \`docker-compose.yml\`, or CI/CD configs in \`.github/workflows/\`. The project uses ${languages.join(', ')} which can be deployed to platforms like Vercel (frontend) and Railway/Render (backend).`;
  }

  if (q.includes('setup') || q.includes('install') || q.includes('run')) {
    return `To set up **${repoName}** locally:\n1. Clone the repo\n2. Install dependencies with \`npm install\`\n3. Copy \`.env.example\` to \`.env\` and configure variables\n4. Run \`npm run dev\` to start the development server`;
  }

  if (q.includes('api') || q.includes('route') || q.includes('endpoint')) {
    return `API routes are defined in the \`routes/\` directory. Each route file maps HTTP methods to controller functions in \`controllers/\`. ${backend.includes('Express.js') ? 'Express Router is used for modular routing.' : ''} Check \`server.js\` for the route registration.`;
  }

  // Generic answer
  return `**${repoName}** is built with ${languages.join(', ') || 'multiple languages'}${frameworks.length > 0 ? `, using ${frameworks.join(', ')} on the frontend` : ''}${backend.length > 0 ? ` and ${backend.join(', ')} on the backend` : ''}. ${database.length > 0 ? `Data is stored in ${database.join(', ')}.` : ''}\n\nTo learn more about specific features, try asking about authentication, database models, API routes, deployment, or setup instructions.`;
};

/**
 * Answer a user question about a repository.
 *
 * @param {string} question
 * @param {Object} repoContext
 * @returns {Promise<{ answer: string, _mock?: boolean }>}
 */
const generateRepoAnswer = async (question, repoContext) => {
  const client = getClient();

  if (!client) {
    if (process.env.NODE_ENV !== 'production') console.log('[chatService] No OPENAI_API_KEY — returning mock answer');
    return { answer: generateMockAnswer(question, repoContext), _mock: true };
  }

  const contextStr = buildRepoContext(repoContext);

  try {
    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a senior software engineer analyzing a GitHub repository. Answer questions about the repository clearly and concisely. Base your answers on the provided repository information. Use markdown formatting for readability.\n\n${contextStr}`,
        },
        { role: 'user', content: question },
      ],
      temperature: 0.5,
      max_tokens: 1000,
    });

    return { answer: completion.choices[0]?.message?.content || 'No answer generated.' };
  } catch (apiError) {
    if (process.env.NODE_ENV !== 'production') console.error('[chatService] OpenAI error — falling back to mock:', apiError.message);
    return { answer: generateMockAnswer(question, repoContext), _mock: true };
  }
};

module.exports = { generateRepoAnswer };
