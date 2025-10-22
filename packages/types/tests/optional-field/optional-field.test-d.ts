/// <reference path="./optional-field.d.ts" />
import { assertType, describe, expectTypeOf, test } from "vitest";

describe("ClientConfig with optional UserClientConfig field", () => {
  test("should allow empty config when all fields are optional", () => {
    assertType<Tailordb.ClientConfig>({});
  });

  test("should allow config with any combination of optional fields", () => {
    assertType<Tailordb.ClientConfig>({ timeout: 5000 });
    assertType<Tailordb.ClientConfig>({ namespace: "default" });
    assertType<Tailordb.ClientConfig>({ timeout: 5000, namespace: "default" });
  });

  test("should verify type structure with expectTypeOf", () => {
    type Expected = { timeout?: number; namespace?: string };
    expectTypeOf<Tailordb.ClientConfig>().toExtend<Expected>();
    expectTypeOf<Expected>().toExtend<Tailordb.ClientConfig>();
  });
});
