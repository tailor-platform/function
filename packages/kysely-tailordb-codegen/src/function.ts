import { Kysely } from "kysely";
import { PostgresDialect, TypeScriptSerializer } from "kysely-codegen";
import { TailordbDialect } from "@tailor-platform/function-kysely-tailordb";

export default async (args: { namespace: string }) => {
  const client = new tailordb.Client({
    namespace: args.namespace,
  });
  const db = new Kysely<any>({
    dialect: new TailordbDialect(client),
  });
  const dialect = new PostgresDialect({ domains: false });
  const metadata = await dialect.introspector.introspect({ db });
  const data = new TypeScriptSerializer().serializeFile(metadata, dialect);
  return { data };
};
