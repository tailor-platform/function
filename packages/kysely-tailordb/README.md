> This is not an experimental package. but it is ready for production use.

# @tailor-platform/function-kysely-tailordb

[Kysely](https://github.com/kysely-org/kysely) dialect for TailorDB

## Usage

We recommend installing [@tailor-platform/function-types](https://www.npmjs.com/package/@tailor-platform/function-types) along with @tailor-platform/function-kysely-tailordb, as you’ll need these types to use the dialect effectively.

```sh
npm install -D @tailor-platform/function-types
npm install @tailor-platform/function-kysely-tailordb
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
