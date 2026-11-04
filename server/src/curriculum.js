import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
const read = (name) => JSON.parse(fs.readFileSync(fileURLToPath(new URL(name, import.meta.url)), 'utf8'));
export const modules = read('./modules.json').map(({ id, ...content }, index) => ({ ...content, _id: `course-${id}`, legacyId: id, order: index + 1, published: true }));
export const theory = read('./theory.json').map(({ id, ...content }) => ({ ...content, _id: id, published: true }));
export const completedIds = (user) => (user.completedCourseModules || []).map((id) => `course-${id}`);
