# @tailor-platform/function-typeorm-tailordb-codegen

Generate TypeORM entity code for TailorDB

## Usage

```sh
# npm
npm install -D @tailor-platform/function-typeorm-tailordb-codegen
npx typeorm-tailordb-codegen -h

# pnpm
pnpm add -D @tailor-platform/function-typeorm-tailordb-codegen
pnpm exec typeorm-tailordb-codegen -h
```

```
Usage: typeorm-tailordb-codegen [options]

Generate TypeORM entity code for TailorDB

Options:
  -a, --app <string>          App name
  -n, --namespace <string>    TailorDB namespace
  -m, --machineuser <string>  Machine user name
  -o, --output <string>       Output file name
  -h, --help                  display help for command
```

## Requirements

This command uses `tailorctl` internally to run the generation script on the Tailor Platform. Make sure `tailorctl` is installed and workspace is selected.

## Workflow (no schema sync/migrations)

- TailorDB is the source of truth for schema. TypeORM schema sync (`synchronize`) and migrations are not supported in this integration.
- Use this codegen to regenerate entity classes from TailorDB whenever the schema changes.
- Commit the generated files to your repository and import them where needed.

Example:

```sh
npx typeorm-tailordb-codegen -a <app> -n <namespace> -m <machineuser> -o src/entities.ts
```

Then in your code:

```ts
import * as Entities from './entities';
// or import specific classes: import { App_Users } from './entities';
```

## Notes

- Primary keys cannot be determined from the available metadata used here. The generator will mark a column named `id` as the primary key by convention, and will use `@PrimaryGeneratedColumn` if the column is auto-incrementing. Please adjust as needed for your schema.
- Column types are inferred from TailorDB’s Postgres-like data types and passed through to TypeORM.

## Using @tailor-platform/function-types

If you write code that runs in the Tailor Platform Function environment (for example, custom scripts that use the global `tailordb` client), install the types package so TypeScript recognizes the globals.

1) Install as a dev dependency

```sh
npm install -D @tailor-platform/function-types
```

2) Tell TypeScript to include the ambient types in your `tsconfig.json`

```json
{
  "compilerOptions": {
    "types": ["@tailor-platform/function-types"]
  }
}
```

You can then use the global `tailordb.Client` with type safety in your scripts.
