# @tailor-platform/function-types

**Deprecated.** These types are now built into [`@tailor-platform/sdk`](https://www.npmjs.com/package/@tailor-platform/sdk), which exposes the same `tailor.*` / `tailordb.*` runtime surface plus typed wrappers you can import directly instead of relying on ambient globals. New projects should use `@tailor-platform/sdk` instead of this package; existing projects should migrate using the steps below.

This package will no longer receive updates for new runtime APIs (e.g. it never picked up `tailor.aigateway.get()`, while `@tailor-platform/sdk` will keep gaining new runtime APIs).

## Migrating to `@tailor-platform/sdk`

1. Add `@tailor-platform/sdk` and remove this package:

   ```sh
   npm i -D @tailor-platform/sdk
   npm uninstall @tailor-platform/function-types
   ```

   If your project already depends on `@tailor-platform/sdk` (e.g. for `tailor.config.ts`, resolvers, or workflows), you can skip the install step.

2. Update `tsconfig.json` to load the runtime globals from the SDK instead:

   ```diff
     {
       "compilerOptions": {
   -      "types": ["@tailor-platform/function-types"]
   +      "types": ["@tailor-platform/sdk/runtime/globals"]
       }
     }
   ```

3. No other code changes are required. The global `tailor.*` and `tailordb.*` identifiers keep the same names and shapes (including the legacy capitalized `Tailordb.Client`, which `@tailor-platform/sdk` also keeps around for compatibility with this package).

### Prefer typed imports over ambient globals (optional)

Instead of relying on the ambient `tailor` / `tailordb` globals, `@tailor-platform/sdk/runtime` exposes the same APIs as regular imports, which is easier to trace and doesn't require the `tsconfig.json` `types` change above:

```typescript
import { iconv, secretmanager, idp, workflow, context, authconnection, file } from "@tailor-platform/sdk/runtime";

const secret = await secretmanager.getSecret("my-vault", "API_KEY");
```

### Known gap: `tailor.aigateway`

`@tailor-platform/sdk` does not yet expose a runtime equivalent of `tailor.aigateway.get(name)`. If your code uses it, keep this package installed alongside `@tailor-platform/sdk` for that one namespace until the SDK adds support, or reach out to the SDK team if you need this migrated sooner.

## Legacy usage (this package)

```sh
npm i -D @tailor-platform/function-types
```

```json
{
  "compilerOptions": {
    "types": ["@tailor-platform/function-types"]
  }
}
```
