// Headings follow the source slides; the lesson text remains editable in the database.
const headings = {
  102: ['Illustrative industries:'],
  105: ['Level Role Typical Salary Range*'],
  106: ['Prerequisites / Skills:', 'Qualifications & Certifications:'],
  107: ['Player Experience', 'Brand Reputation', 'Cost Savings', 'Smoother Development'],
  108: ['Pre-Production', 'Production', 'Launch & Beyond'],
  109: ['Functional Testing', 'UI/UX Testing', 'Playtesting', 'Compatibility Testing'],
  110: ['What is Functional Testing?', 'Common Functional Bugs:'],
  111: ['What is UI/UX Testing?', 'Example: Text Cutoff', 'Example: Button Overlap'],
  112: ['Fun Factor', 'Balance & Pacing', 'Difficulty Curve'],
  113: ['Device Variations', 'OS Versions', 'Resolutions & Displays', 'Performance Issues'],
  114: ['Key Responsibilities', 'Session Takeaways'],
  115: ['Visual Anomalies', 'Functional Issues'],
  116: ['Exploratory Testing', 'Edge Case Testing', 'Regression Testing'],
  117: ['Clear Title', 'Reproduction Steps', 'Expected vs Actual', 'Environment Details', 'Visual Evidence', 'Severity Level'],
  118: ['Poor Example', '✓ Good Example'],
  119: ['Step 1', 'Step 2', 'Step 3', 'Step 4', 'Result'],
  120: ['Expected Result', 'Actual Result'],
  121: ['Device Information', 'Operating System', 'App Details', 'Network Conditions'],
  122: ['Practice on PlayzHub', 'Create Your Template', 'Build Your Portfolio']
};

const sourceTitles = {
  101: 'What is a game?', 102: 'What is Gamification?', 103: 'What is Game Testing?',
  104: 'The Game Testing Landscape – Global & India', 105: 'Game Tester Salary Range in India',
  106: 'How One Can Become a Professional Game Tester?', 107: 'Why QA Matters in Gaming',
  108: 'QA in the Game Development\nPipeline', 109: 'Types of Game Testing',
  110: 'Functional Testing Deep Dive', 111: 'UI/UX Testing Essentials',
  112: 'Playtesting for Engagement', 113: 'Compatibility Testing Coverage',
  114: 'The Role of a Game Tester', 115: 'How to Spot Bugs in Mobile\nGames',
  116: 'Key Testing Strategies', 117: 'Anatomy of an Excellent Bug Report',
  118: 'Writing an Effective Bug Title', 119: 'Steps to Reproduce',
  120: 'Expected vs Actual Results', 121: 'Device & Environment Details', 122: 'Your Next Steps'
};

export function formatTheoryContent(text, moduleId) {
  if (!text || !sourceTitles[moduleId]) return null;
  // Remove only exact repeated source headings, preserving any custom-edited content.
  const title = sourceTitles[moduleId];
  let source = text;
  while (source.includes(title)) source = source.replace(title, '');
  const headingSet = new Set(headings[moduleId] || []);
  const blocks = [];
  let current = null;
  const flush = () => { if (current) blocks.push(current); current = null; };
  for (const raw of source.split('\n')) {
    const line = raw.trim();
    if (!line) { flush(); continue; }
    if (headingSet.has(line)) { flush(); blocks.push({ type: 'heading', text: line.replace(/:$/, '') }); continue; }
    if (moduleId === 109 && /^\d$/.test(line)) { flush(); continue; }
    if (line.startsWith('•')) { flush(); current = { type: 'bullet', text: line.slice(1).trim() }; continue; }
    const startsItem = (moduleId === 102 && /^(Corporate training|E-learning|Health & wellness|Marketing\/retail|Insurance Sector|Finance)/.test(line)) ||
      (moduleId === 105 && /^(Entry-level|Mid-level|Advanced)/.test(line));
    if (startsItem) { flush(); current = { type: 'bullet', text: line }; continue; }
    const startsParagraph = /^(Components:|Why it matters:|Why use it:|Global market data:|Market size \(2025\):|According to a report|Early detection is invaluable:|Ready to start|Playtesting focuses|This comparison|Pro tip:|Remember:)/.test(line);
    if (startsParagraph || (current?.type === 'paragraph' && /[.!?]$/.test(current.text))) flush();
    if (!current) current = { type: 'paragraph', text: line };
    else current.text += ` ${line}`;
  }
  flush();
  return blocks;
}
