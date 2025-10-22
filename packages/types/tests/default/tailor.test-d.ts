/// <reference path="../../tailor.d.ts" />
import { assertType, describe, expectTypeOf, test } from "vitest";

describe("ClientConfig default behavior", () => {
  test("should require namespace when UserClientConfig is empty", () => {
    assertType<Tailordb.ClientConfig>({ namespace: "default" });
  });

  test("should not allow empty config without namespace", () => {
    // @ts-expect-error - namespace is required
    assertType<Tailordb.ClientConfig>({});
  });

  test("should match the expected type structure with expectTypeOf", () => {
    type Expected = { namespace: string };
    expectTypeOf<Tailordb.ClientConfig>().toExtend<Expected>();
    expectTypeOf<Expected>().toExtend<Tailordb.ClientConfig>();
  });
});
