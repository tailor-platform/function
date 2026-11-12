/// <reference types="@tailor-platform/function-types" />
import type { TailordbClientInstance } from "@tailor-platform/sdk/runtime";
import type { TailordbDialect } from "../src/index";

type DialectClient = ConstructorParameters<typeof TailordbDialect>[0];

export const fromFunctionTypes = (client: Tailordb.Client): DialectClient =>
  client;
export const fromSdk = (client: TailordbClientInstance): DialectClient =>
  client;
