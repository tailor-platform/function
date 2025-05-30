import { build } from "esbuild";
import { createRequire } from "node:module";
import path from "node:path";
import { nodeless } from "unenv";

const require = createRequire(import.meta.url);

// When importing the Node API (e.g., `import path from "node:path"`),
// the unenv package should be bundled to run even in the Function service.
// Functions that are difficult to execute in the Function service (e.g., `fs.writeFile`)
// will be bundled as mocks and will throw a "not implemented" error at runtime.
const unenvAlias = {
  name: "unenv-alias",
  setup(build) {
    const alias = nodeless.alias;
    const re = new RegExp(`^(${Object.keys(alias).join("|")})$`);

    build.onResolve({ filter: re }, (args) => {
      const resolved = require.resolve(alias[args.path]);
      // Since require.resolve() always resolves to cjs,
      // it needs to be converted to mjs when this callback is invoked via import.
      const path =
        args.kind === "require-call"
          ? resolved
          : resolved.replace(/\.cjs$/, ".mjs");
      return { path };
    });
  },
};

// Inject the unenv package to emulate the behavior of global variables (e.g., process)
// that do not exist within the Function service.
const unenvInject = {
  name: "unenv-inject",
  setup(build) {
    const inject = nodeless.inject;
    const re = /unenv-inject-([^.]+)\.js$/;
    const prefix = path.join(import.meta.dirname, "unenv-inject-");

    build.initialOptions.inject = [
      ...(build.initialOptions.inject ?? []),
      ...Object.keys(inject).map((globalName) => `${prefix}${globalName}.js`),
    ];

    build.onResolve({ filter: re }, ({ path }) => ({ path }));

    build.onLoad({ filter: re }, ({ path }) => {
      const globalName = path.match(re)[1];
      return {
        contents: getInjectContent(globalName, inject[globalName]),
      };
    });
  },
};

const getInjectContent = (globalName, globalInject) => {
  if (typeof globalInject === "string") {
    return `import globalVar from "${globalInject}"; globalThis.${globalName} = globalVar;`;
  }
  const [moduleSpecifier, exportName] = globalInject;
  return `import { ${exportName} } from "${moduleSpecifier}"; globalThis.${globalName} = ${exportName};`;
};

// Due to the use of dynamic require, bundling `git-diff` is difficult.
// However, since it's not used in this use case, we can mock it instead.
const mockGitDiff = {
  name: "mock-git-diff",
  setup(build) {
    build.onResolve({ filter: /^git-diff$/ }, (args) => {
      return { path: args.path, namespace: "git-diff" };
    });
    build.onLoad({ filter: /.*/, namespace: "git-diff" }, () => {
      return { contents: "export default null" };
    });
  },
};

build({
  entryPoints: ["src/function.ts"],
  outfile: "dist/function.js",
  format: "esm",
  bundle: true,
  minify: true,
  define: {
    global: "globalThis",
  },
  plugins: [unenvAlias, unenvInject, mockGitDiff],
  // Unused drivers are left unbundled as-is.
  // Note that future updates to `kysely-codegen` may introduce new drivers.
  external: [
    "@libsql/kysely-libsql",
    "@tediousjs/connection-string",
    "better-sqlite3",
    "bun:sqlite",
    "kysely-bun-sqlite",
    "mysql2",
    "pg",
    "tarn",
    "tedious",
  ],
});

build({
  entryPoints: ["src/cli.ts"],
  outfile: "dist/cli.js",
  format: "esm",
});
