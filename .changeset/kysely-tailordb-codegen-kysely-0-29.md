---
"@tailor-platform/function-kysely-tailordb-codegen": patch
---

Build against Kysely 0.29. The table metadata handed to kysely-codegen now sets `isForeign` for foreign tables, which Kysely 0.29 requires and its own PostgreSQL introspector fills in the same way.
