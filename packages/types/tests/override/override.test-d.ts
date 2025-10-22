/// <reference path="./override.d.ts" />
import { assertType, describe, expectTypeOf, test } from "vitest";

describe("ClientConfig with UserClientConfig overriding DefaultClientConfig", () => {
  test("should make namespace required", () => {
    assertType<Tailordb.ClientConfig>({ namespace: "default" });
  });

  test("should not allow config without required namespace", () => {
    // @ts-expect-error - namespace is required
    assertType<Tailordb.ClientConfig>({});
  });

  test("should verify type structure with expectTypeOf", () => {
    type Expected = { namespace: string };
    expectTypeOf<Tailordb.ClientConfig>().toExtend<Expected>();
    expectTypeOf<Expected>().toExtend<Tailordb.ClientConfig>();
  });
});
