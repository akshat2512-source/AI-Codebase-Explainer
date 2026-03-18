const PDFDocument = require('pdfkit');
const { PassThrough } = require('stream');

/**
 * Colour palette & layout constants
 */
const COLORS = {
  primary: '#3B82F6',
  primaryDark: '#1E3A5F',
  text: '#1E293B',
  muted: '#64748B',
  accent: '#10B981',
  sectionBg: '#F1F5F9',
  white: '#FFFFFF',
  border: '#CBD5E1',
};

const MARGIN = 50;

/* ─── helpers ─────────────────────────────────────────────────────── */

/** Draw a horizontal rule */
const drawHR = (doc, y) => {
  doc
    .strokeColor(COLORS.border)
    .lineWidth(0.5)
    .moveTo(MARGIN, y)
    .lineTo(doc.page.width - MARGIN, y)
    .stroke();
};

/** Section heading */
const sectionHeading = (doc, title, icon = '▸') => {
  doc.moveDown(1.2);
  doc
    .fontSize(16)
    .fillColor(COLORS.primary)
    .text(`${icon}  ${title}`, MARGIN, doc.y, { underline: false });
  doc.moveDown(0.4);
  drawHR(doc, doc.y);
  doc.moveDown(0.6);
};

/** Key-value pair on one line */
const kvLine = (doc, key, value) => {
  doc
    .fontSize(10)
    .fillColor(COLORS.muted)
    .text(`${key}: `, MARGIN, doc.y, { continued: true })
    .fillColor(COLORS.text)
    .text(String(value ?? 'N/A'));
};

/** Bullet point */
const bullet = (doc, text, indent = 10) => {
  doc
    .fontSize(10)
    .fillColor(COLORS.text)
    .text(`•  ${text}`, MARGIN + indent, doc.y);
};

/** Wrap long text safely */
const safeParagraph = (doc, text) => {
  doc
    .fontSize(10)
    .fillColor(COLORS.text)
    .text(String(text || '(empty)'), MARGIN, doc.y, {
      width: doc.page.width - MARGIN * 2,
      lineGap: 3,
    });
};

/* ─── main export ─────────────────────────────────────────────────── */

/**
 * Generates a styled PDF analysis report.
 *
 * @param {Object} analysis  — full Analysis document from MongoDB
 * @returns {{ stream: PassThrough, fileName: string }}
 */
const generateAnalysisReport = (analysis) => {
  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 60, bottom: 60, left: MARGIN, right: MARGIN },
    bufferPages: true,
    info: {
      Title: `Analysis Report — ${analysis.repoName}`,
      Author: 'AI Codebase Explainer',
    },
  });

  const stream = new PassThrough();
  doc.pipe(stream);

  const pageWidth = doc.page.width - MARGIN * 2;

  /* ── Cover / Title ── */
  doc
    .rect(0, 0, doc.page.width, 140)
    .fill(COLORS.primaryDark);

  doc
    .fontSize(28)
    .fillColor(COLORS.white)
    .text('Analysis Report', MARGIN, 45, { width: pageWidth });

  doc
    .fontSize(13)
    .fillColor('#93C5FD')
    .text(
      `${analysis.owner || ''}/${analysis.repoName || ''}`,
      MARGIN,
      85,
      { width: pageWidth }
    );

  doc
    .fontSize(9)
    .fillColor('#94A3B8')
    .text(
      `Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}  •  AI Codebase Explainer`,
      MARGIN,
      112,
      { width: pageWidth }
    );

  doc.y = 160;

  /* ─────────────────────────────────────────────────────────────────
   * 1. Repository Overview
   * ────────────────────────────────────────────────────────────── */
  sectionHeading(doc, 'Repository Overview', '📦');

  const meta = analysis.metadata || {};
  kvLine(doc, 'Repository', `${analysis.owner}/${analysis.repoName}`);
  kvLine(doc, 'URL', analysis.repoUrl);
  if (meta.description) kvLine(doc, 'Description', meta.description);
  kvLine(doc, 'Primary Language', meta.language || 'N/A');
  kvLine(doc, 'Stars', meta.stars ?? 'N/A');
  kvLine(doc, 'Forks', meta.forks ?? 'N/A');
  kvLine(doc, 'Open Issues', meta.openIssues ?? 'N/A');
  kvLine(doc, 'License', meta.license || 'None');
  kvLine(doc, 'Default Branch', meta.defaultBranch || 'N/A');
  if (meta.createdAt) kvLine(doc, 'Created', new Date(meta.createdAt).toLocaleDateString());
  if (meta.updatedAt) kvLine(doc, 'Last Updated', new Date(meta.updatedAt).toLocaleDateString());

  /* ─────────────────────────────────────────────────────────────────
   * 2. Detected Tech Stack
   * ────────────────────────────────────────────────────────────── */
  sectionHeading(doc, 'Detected Tech Stack', '🛠');

  const tech = analysis.techStack || {};
  const techCategories = [
    { key: 'languages', label: 'Languages' },
    { key: 'frameworks', label: 'Frameworks' },
    { key: 'backend', label: 'Backend' },
    { key: 'database', label: 'Database' },
    { key: 'devTools', label: 'Dev Tools' },
    { key: 'testing', label: 'Testing' },
    { key: 'cloud', label: 'Cloud / Infra' },
  ];

  for (const cat of techCategories) {
    const items = tech[cat.key];
    if (!items || (Array.isArray(items) && items.length === 0)) continue;

    doc
      .fontSize(11)
      .fillColor(COLORS.primary)
      .text(cat.label, MARGIN, doc.y);
    doc.moveDown(0.2);

    const list = Array.isArray(items) ? items : [items];
    for (const item of list) {
      const name = typeof item === 'string' ? item : item.name || JSON.stringify(item);
      bullet(doc, name);
    }
    doc.moveDown(0.4);
  }

  /* ─────────────────────────────────────────────────────────────────
   * 3. AI Codebase Explanation
   * ────────────────────────────────────────────────────────────── */
  sectionHeading(doc, 'AI Codebase Explanation', '🤖');

  const ai = analysis.aiExplanation || {};

  if (ai.overview) {
    doc.fontSize(11).fillColor(COLORS.primary).text('Overview', MARGIN, doc.y);
    doc.moveDown(0.2);
    safeParagraph(doc, ai.overview);
    doc.moveDown(0.6);
  }

  if (ai.architecture) {
    doc.fontSize(11).fillColor(COLORS.primary).text('Architecture', MARGIN, doc.y);
    doc.moveDown(0.2);
    safeParagraph(doc, ai.architecture);
    doc.moveDown(0.6);
  }

  if (ai.keyComponents && ai.keyComponents.length > 0) {
    doc.fontSize(11).fillColor(COLORS.primary).text('Key Components', MARGIN, doc.y);
    doc.moveDown(0.2);
    for (const comp of ai.keyComponents) {
      if (typeof comp === 'string') {
        bullet(doc, comp);
      } else {
        bullet(doc, `${comp.name || comp.component || ''} — ${comp.description || ''}`);
      }
    }
    doc.moveDown(0.6);
  }

  if (ai.setup) {
    doc.fontSize(11).fillColor(COLORS.primary).text('Setup Instructions', MARGIN, doc.y);
    doc.moveDown(0.2);
    safeParagraph(doc, ai.setup);
    doc.moveDown(0.6);
  }

  /* ─────────────────────────────────────────────────────────────────
   * 4. Architecture Diagram
   * ────────────────────────────────────────────────────────────── */
  if (ai.architectureDiagram || analysis.architectureDiagram) {
    sectionHeading(doc, 'Architecture Diagram (Mermaid)', '📐');
    const mermaid = ai.architectureDiagram || analysis.architectureDiagram;
    doc
      .fontSize(9)
      .fillColor(COLORS.muted)
      .text(
        'Note: Paste the Mermaid code below into https://mermaid.live to render the diagram.',
        MARGIN,
        doc.y,
        { width: pageWidth }
      );
    doc.moveDown(0.4);

    // Render mermaid code in a monospace box
    doc
      .rect(MARGIN, doc.y, pageWidth, 4)
      .fill(COLORS.sectionBg);
    doc.moveDown(0.2);
    doc
      .font('Courier')
      .fontSize(8)
      .fillColor(COLORS.text)
      .text(String(mermaid), MARGIN + 8, doc.y, {
        width: pageWidth - 16,
        lineGap: 2,
      });
    doc.font('Helvetica');
    doc.moveDown(0.6);
  }

  /* ─────────────────────────────────────────────────────────────────
   * 5. File Structure Summary
   * ────────────────────────────────────────────────────────────── */
  if (meta.tree || meta.files) {
    sectionHeading(doc, 'File Structure Summary', '📂');

    const files = meta.tree || meta.files || [];
    const topLevel = Array.isArray(files)
      ? files
          .filter((f) => !String(f.path || f).includes('/'))
          .slice(0, 40)
      : [];

    if (topLevel.length > 0) {
      for (const f of topLevel) {
        const path = typeof f === 'string' ? f : f.path || '';
        const type = f.type === 'tree' ? '📁' : '📄';
        bullet(doc, `${type}  ${path}`);
      }
    } else {
      doc
        .fontSize(10)
        .fillColor(COLORS.muted)
        .text('File structure data was not included in this analysis.', MARGIN, doc.y);
    }
  }

  /* ── Footer on every page ── */
  const pages = doc.bufferedPageRange();
  for (let i = 0; i < pages.count; i++) {
    doc.switchToPage(i);
    doc
      .fontSize(8)
      .fillColor(COLORS.muted)
      .text(
        `AI Codebase Explainer  •  Page ${i + 1} of ${pages.count}`,
        MARGIN,
        doc.page.height - 40,
        { width: pageWidth, align: 'center' }
      );
  }

  doc.end();

  const safeRepoName = (analysis.repoName || 'report').replace(/[^a-zA-Z0-9_-]/g, '_');
  return {
    stream,
    fileName: `${safeRepoName}-analysis-report.pdf`,
  };
};

module.exports = { generateAnalysisReport };
