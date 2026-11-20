# @tailor-platform/function-kysely-tailordb

## 0.1.4

### Patch Changes

- [#224](https://github.com/tailor-platform/function/pull/224) [`0483ef9`](https://github.com/tailor-platform/function/commit/0483ef9fff0592c33e7b3ba9450eae276956439d) Thanks [@toiroakr](https://github.com/toiroakr)! - Stop depending on the global `Tailordb` type namespace. `TailordbDialect` now describes its client by shape (`connect`, `end` and `queryObject`), so the published declarations type-check without `@tailor-platform/function-types`, which is deprecated. Runtime behavior is unchanged, and both the legacy `Tailordb.Client` and the `tailordb.Client` of `@tailor-platform/sdk` can still be passed.

- [#225](https://github.com/tailor-platform/function/pull/225) [`8283c1b`](https://github.com/tailor-platform/function/commit/8283c1bba6f0fc55793769daae3028a2b7381910) Thanks [@toiroakr](https://github.com/toiroakr)! - Build the package with tsdown instead of tsup. The published files keep their names (`index.js`, `index.cjs`, `index.d.ts`, `index.d.cts`), and the exports and behavior are the same.

## 0.1.3

### Patch Changes

- [#106](https://github.com/tailor-platform/function/pull/106) [`30c9875`](https://github.com/tailor-platform/function/commit/30c9875b25ab5f5eea8686fc9dcacbbbb0e1a00e) Thanks [@remiposo](https://github.com/remiposo)! - add CHANGELOG.md
