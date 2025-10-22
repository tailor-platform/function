/// <reference path="./optional-field.d.ts" />
import { assertType, describe, expectTypeOf, test } from "vitest";

describe("ClientConfig with optional UserClientConfig field", () => {
  test("should require namespace even when all UserClientConfig fields are optional", () => {
    assertType<Tailordb.ClientConfig>({ namespace: "default" });
  });

  test("should allow config with any combination of optional fields", () => {
    assertType<Tailordb.ClientConfig>({ timeout: 5000, namespace: "default" });
    assertType<Tailordb.ClientConfig>({ namespace: "default" });

    // @ts-expect-error - namespace is required
    assertType<Tailordb.ClientConfig>({});

    // @ts-expect-error - namespace is required
    assertType<Tailordb.ClientConfig>({ timeout: 5000 });
  });

  test("should verify type structure with expectTypeOf", () => {
    type Expected = { timeout?: number; namespace: string };
    expectTypeOf<Tailordb.ClientConfig>().toExtend<Expected>();
    expectTypeOf<Expected>().toExtend<Tailordb.ClientConfig>();
  });
});
