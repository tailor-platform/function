/// <reference path="../../tailor.d.ts" />
import { assertType, describe, expectTypeOf, test } from "vitest";

describe("ClientConfig default behavior", () => {
  test("should allow empty config when UserClientConfig is empty", () => {
    assertType<Tailordb.ClientConfig>({});
  });

  test("should allow config with optional namespace", () => {
    assertType<Tailordb.ClientConfig>({ namespace: "default" });
  });

  test("should match the expected type structure with expectTypeOf", () => {
    type Expected = { namespace?: string };
    expectTypeOf<Tailordb.ClientConfig>().toExtend<Expected>();
    expectTypeOf<Expected>().toExtend<Tailordb.ClientConfig>();
  });
});
