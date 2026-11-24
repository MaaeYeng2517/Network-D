import { WEEKS_A } from "./course/weeks-a.js";
import { WEEKS_B } from "./course/weeks-b.js";
import { WEEKS_C } from "./course/weeks-c.js";
import { ENRICHMENT } from "./course/enrichment.js";

export { COURSE, TOOLS, PRACTICALS, PROJECT, OUTCOMES, MODULES, SCHEDULE, ASSESSMENT } from "./course/meta.js";

export const WEEKS = [...WEEKS_A, ...WEEKS_B, ...WEEKS_C].map((w) => ({
  ...w,
  ...(ENRICHMENT[w.n] || {}),
}));