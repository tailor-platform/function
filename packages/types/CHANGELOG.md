# @tailor-platform/function-types

## 0.10.1

### Patch Changes

- [#190](https://github.com/tailor-platform/function/pull/190) [`09dfbcc`](https://github.com/tailor-platform/function/commit/09dfbccaa0449077bf0e768bb85939918de2709f) Thanks [@toiroakr](https://github.com/toiroakr)! - Deprecate this package in favor of `@tailor-platform/sdk`, which now covers the same `tailor.*` / `tailordb.*` runtime surface. The README documents the deprecation and migration steps.

## 0.10.0

### Minor Changes

- [#189](https://github.com/tailor-platform/function/pull/189) [`2e2f241`](https://github.com/tailor-platform/function/commit/2e2f241b0e9bb1480de7e376abbef3cd27aae30d) Thanks [@dragon3](https://github.com/dragon3)! - Add `tailor.aigateway.get(name)` types for resolving an AI Gateway URL in the caller's workspace.

### Patch Changes

- [#180](https://github.com/tailor-platform/function/pull/180) [`a36c24f`](https://github.com/tailor-platform/function/commit/a36c24faa835a350617b4f29c6e848894bcdc1e3) Thanks [@k1LoW](https://github.com/k1LoW)! - Remove non-existent `updatedAt` field from `tailor.idp.User`

## 0.9.0

### Minor Changes

- [#178](https://github.com/tailor-platform/function/pull/178) [`1b2e22b`](https://github.com/tailor-platform/function/commit/1b2e22b6f9895fd25df353a4680fb2bd6465b9b7) Thanks [@haru0017](https://github.com/haru0017)! - Add `downloadStream` and `uploadStream` types to `TailorDBFileAPI`. Mark `openDownloadStream` as deprecated.

## 0.8.5

### Patch Changes

- [#169](https://github.com/tailor-platform/function/pull/169) [`eb7a92d`](https://github.com/tailor-platform/function/commit/eb7a92d424d6d6dbc5c55559d2f21e5bcb4b5aec) Thanks [@remiposo](https://github.com/remiposo)! - Add `tailor.context` namespace with `getInvoker()` for retrieving information about the invoker of the current function execution

## 0.8.4

### Patch Changes

- [#158](https://github.com/tailor-platform/function/pull/158) [`dc091f4`](https://github.com/tailor-platform/function/commit/dc091f48c30eef11304191af946c43b8f675ea37) Thanks [@k1LoW](https://github.com/k1LoW)! - Add optional `fromName` and `subject` params to `SendPasswordResetEmailInput`

## 0.8.3

### Patch Changes

- [#150](https://github.com/tailor-platform/function/pull/150) [`02134c6`](https://github.com/tailor-platform/function/commit/02134c6ce2014a7f82440650c4d4f9345be96f7b) Thanks [@k1LoW](https://github.com/k1LoW)! - Add `userByName` method to `tailor.idp.Client` for fetching a user by name

## 0.8.2

### Patch Changes

- [#131](https://github.com/tailor-platform/function/pull/131) [`cdac331`](https://github.com/tailor-platform/function/commit/cdac3319608f5b6b425545ceaae795088bfb7047) Thanks [@k1LoW](https://github.com/k1LoW)! - Make `password` optional in `CreateUserInput` and add `clearPassword` to `UpdateUserInput`

## 0.8.1

### Patch Changes

- [#128](https://github.com/tailor-platform/function/pull/128) [`84ce6ba`](https://github.com/tailor-platform/function/commit/84ce6ba209e0c7bf51d0646ecfdcc32403904da6) Thanks [@k1LoW](https://github.com/k1LoW)! - feat: Add tailor.idp namespace type definitions

## 0.7.2

### Patch Changes

- [#110](https://github.com/tailor-platform/function/pull/110) [`56b83a1`](https://github.com/tailor-platform/function/commit/56b83a1c2d0511374ddb61f625583799811fe5ed) Thanks [@toiroakr](https://github.com/toiroakr)! - fix: require Tailordb namespace

## 0.7.1

### Patch Changes

- [#106](https://github.com/tailor-platform/function/pull/106) [`30c9875`](https://github.com/tailor-platform/function/commit/30c9875b25ab5f5eea8686fc9dcacbbbb0e1a00e) Thanks [@remiposo](https://github.com/remiposo)! - add CHANGELOG.md
