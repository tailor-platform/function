> This is not an experimental package. but it is ready for production use.

# @tailor-platform/function-kysely-tailordb

[Kysely](https://github.com/kysely-org/kysely) dialect for TailorDB

## Usage

`TailordbDialect` takes the `tailordb.Client` of the Tailor Platform function runtime. It describes the client by its shape (`connect`, `end` and `queryObject`), so it does not need any ambient type declarations to type-check.

To type the `tailordb` global in your own code, load the runtime globals of [@tailor-platform/sdk](https://www.npmjs.com/package/@tailor-platform/sdk) in `tsconfig.json`:

```sh
npm install -D @tailor-platform/sdk
npm install @tailor-platform/function-kysely-tailordb
```

```json
{
  "compilerOptions": {
    "types": ["@tailor-platform/sdk/runtime/globals"]
  }
}
```

```typescript
import { Kysely } from 'kysely';
import { TailordbDialect } from '@tailor-platform/function-kysely-tailordb';

const client = new tailordb.Client({
  namespace: '<tailordb namespace>',
});

const db = new Kysely<Database>({
  dialect: new TailordbDialect(client),
});
```
