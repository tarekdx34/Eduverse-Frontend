const fs = require("fs");
const p = "src/pages/student-dashboard/components/LabInstructions.tsx";
let c = fs.readFileSync(p, "utf8");
const lines = c.split("\n");
console.log("Lines:", lines.length);
