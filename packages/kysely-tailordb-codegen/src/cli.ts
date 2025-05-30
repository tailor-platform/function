#!/usr/bin/env node
import { program } from "commander";
import "zx/globals";

program
  .name("kysely-tailordb-codegen")
  .description("Generate Kysely code for TailorDB")
  .requiredOption("-a, --app <string>", "App name")
  .requiredOption("-n, --namespace <string>", "TailorDB namespace")
  .requiredOption("-m, --machineuser <string>", "Machine user name")
  .requiredOption("-o, --output <string>", "Output file name")
  .parse();

const options = program.opts();
const { app, namespace, machineuser, output } = options;
const arg = `{"namespace": "${namespace}"}`;
const script = path.join(import.meta.dirname, "function.js");
const out = path.resolve(process.cwd(), output);

console.log(
  `Generating code for TailorDB namespace "${namespace}" in app "${app}"...`
);

const result =
  await $`tailorctl workspace function test-run -a ${app} -g ${arg} -m ${machineuser} -s ${script}`
    .quiet()
    .nothrow();
if (!result.ok) {
  program.error(
    `${chalk.red.bold("ERROR")} tailorctl failed with exit code ${
      result.exitCode
    }.\n${result.stderr}`
  );
}

let json;
try {
  const match = result.stdout.match(/\{"data":.*\}/);
  json = JSON.parse(match![0]);
} catch {
  program.error(
    `${chalk.red.bold("ERROR")} Failed to parse output from tailorctl.`
  );
}

try {
  await fs.outputFile(out, json.data);
} catch {
  program.error(`${chalk.red.bold("ERROR")} Failed to write output.`);
}

console.log(`✨ Code generated successfully and saved to ${output}.`);
