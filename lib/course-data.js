import { WEEKS_A } from "./course/weeks-a";
import { WEEKS_B } from "./course/weeks-b";
import { WEEKS_C } from "./course/weeks-c";
import { ENRICHMENT } from "./course/enrichment";

export { COURSE, TOOLS, PRACTICALS, PROJECT, OUTCOMES, MODULES, SCHEDULE, ASSESSMENT } from "./course/meta";

export const WEEKS = [...WEEKS_A, ...WEEKS_B, ...WEEKS_C].map((w) => ({
  ...w,
  ...(ENRICHMENT[w.n] || {}),
}));