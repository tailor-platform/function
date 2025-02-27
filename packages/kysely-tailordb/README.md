# @tailor-platform/function-kysely-tailordb

[Kysely](https://github.com/kysely-org/kysely) dialect for TailorDB

## Usage

You should install [`@tailor-platform/function-types`](https://www.npmjs.com/package/@tailor-platform/function-types) with `@tailor-platform/function-kysely-tailordb` as you will need the types to use the dialect.

```sh
npm install -D @tailor-platform/function-types
npm install @tailor-platform/function-kysely-tailordb
```

```typescript
import { Kysely } from 'kysely';
import { TailordbDialect } from '@tailor-platform/kysely-tailordb';

const client = new tailordb.Client({
  namespace: '<tailordb namespace>',
});

const db = new Kysely<Database>({
  dialect: new TailordbDialect(client),
});
```
