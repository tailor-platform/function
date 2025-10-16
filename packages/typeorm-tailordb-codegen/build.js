import { createRequire } from "node:module";
import path from "node:path";
import { build } from "esbuild";
import { nodeless } from "unenv";

const require = createRequire(import.meta.url);

const unenvAlias = {
  name: "unenv-alias",
  setup(build) {
    const alias = nodeless.alias;
    const re = new RegExp(`^(${Object.keys(alias).join("|")})$`);
    build.onResolve({ filter: re }, (args) => {
      const resolved = require.resolve(alias[args.path]);
      const p = args.kind === "require-call" ? resolved : resolved.replace(/\.cjs$/, ".mjs");
      return { path: p };
    });
  },
};

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
      return { contents: getInjectContent(globalName, inject[globalName]) };
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

const mockPackages = {
  name: "mock-packages",
  setup(build) {
    build.onResolve({ filter: /^(git-diff|cosmiconfig)$/ }, (args) => {
      return { path: args.path, namespace: "mock-packages" };
    });
    build.onLoad({ filter: /.*/, namespace: "mock-packages" }, () => {
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
  define: { global: "globalThis" },
  plugins: [unenvAlias, unenvInject, mockPackages],
  external: [],
});

build({
  entryPoints: ["src/cli.ts"],
  outfile: "dist/cli.js",
  format: "esm",
});
