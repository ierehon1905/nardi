const { join } = require("path");

const { spawn } = require("child_process");

const executablePath = join(__dirname, "gostrip");

const child = spawn(executablePath, [], {
  stdio: "inherit",
});

// child.on("exit", (code) => {
//   process.stderr.write(`Exit from go with code ${code}\n`);
//   process.exit(code);
// });

process.on("exit", (code) => {
  process.stderr.write(`Exit from js with code ${code}\n`);
  child.kill(code);
});
