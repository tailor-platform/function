/// <reference path="./required-field.d.ts" />
import { assertType, describe, expectTypeOf, test } from "vitest";

describe("ClientConfig with required UserClientConfig field", () => {
  test("should allow config with required field", () => {
    assertType<Tailordb.ClientConfig>({ apiKey: "secret" });
    assertType<Tailordb.ClientConfig>({
      apiKey: "secret",
      namespace: "default",
    });
  });

  test("should not allow config without required field", () => {
    // @ts-expect-error - apiKey is required
    assertType<Tailordb.ClientConfig>({});

    // @ts-expect-error - apiKey is required
    assertType<Tailordb.ClientConfig>({ namespace: "default" });
  });

  test("should verify type structure with expectTypeOf", () => {
    type Expected = { apiKey: string; namespace?: string };
    expectTypeOf<Tailordb.ClientConfig>().toExtend<Expected>();
    expectTypeOf<Expected>().toExtend<Tailordb.ClientConfig>();
  });
});
