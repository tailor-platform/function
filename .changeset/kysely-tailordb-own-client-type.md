---
"@tailor-platform/function-kysely-tailordb": patch
---

Stop depending on the global `Tailordb` type namespace. `TailordbDialect` now describes its client by shape (`connect`, `end` and `queryObject`), so the published declarations type-check without `@tailor-platform/function-types`, which is deprecated. Runtime behavior is unchanged, and both the legacy `Tailordb.Client` and the `tailordb.Client` of `@tailor-platform/sdk` can still be passed.
