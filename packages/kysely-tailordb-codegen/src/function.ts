import { TailordbDialect } from "@tailor-platform/function-kysely-tailordb";
import { Kysely } from "kysely";
import {
  type PostgresDB,
  PostgresDialect,
  TypeScriptSerializer,
} from "kysely-codegen";

export default async (args: { namespace: string }) => {
  const client = new tailordb.Client({
    namespace: args.namespace,
  });
  const db = new Kysely<PostgresDB>({
    dialect: new TailordbDialect(client),
  });
  const dialect = new PostgresDialect({ domains: false });
  const metadata = await dialect.introspector.introspect({ db });
  const data = new TypeScriptSerializer().serializeFile(metadata, dialect);
  return { data };
};
