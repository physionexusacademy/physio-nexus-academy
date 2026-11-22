import fs from "node:fs";
import path from "node:path";
import { renderDecisions } from "./formcheck-decisions.ts";

const file = path.join(process.cwd(), "docs/camera-form-check/03-exercise-camera-decisions.md");
fs.writeFileSync(file, renderDecisions());
console.log(`wrote ${path.relative(process.cwd(), file)}`);
