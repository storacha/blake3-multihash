import { test } from "./lib.test.js"
import { assert } from "chai"

describe("lib", () => {
  for (const [name, unit] of Object.entries(test)) {
    it(name, async () => {
      await unit({ deepEqual: assert.deepStrictEqual })
    })
  }
})
