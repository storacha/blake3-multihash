import * as Blake3 from "blake3-multihash"
import { base64 } from "multiformats/bases/base64"
import { base16 } from "multiformats/bases/base16"
import { inputs } from "./fixtures.js"
import vectors from "./vectors.js"

/**
 * @param {number} from
 * @param {number} to
 */
function* enumerate(from, to) {
  let n = from
  while (n < to) {
    yield n
    n++
  }
}

/**
 * @param {number} size
 */
const input = size => {
  const frame = new Uint8Array(enumerate(0, 251))
  const buffer = new Uint8Array(size)
  let offset = 0
  while (offset < size) {
    const delta = size - offset
    const chunk = delta < frame.length ? frame.subarray(0, delta) : frame
    buffer.set(chunk, offset)
    offset += frame.length
  }
  return buffer
}

/**
 * @typedef {(assert:{deepEqual: <T, U extends T>(actual:T,expected:U,msg?:string)=>void})=>unknown} Test
 * @type {Record<string, Test>}
 */
export const test = {
  "test basics": async assert => {
    for (const fixture of Object.values(inputs)) {
      const multihash = await Blake3.digest(fixture.input)
      assert.deepEqual(multihash.digest, fixture.hash, "hashes match")
    }
  },
}

for (const { hash, input_len: size } of vectors) {
  test[`test vector ${size}`] = async assert => {
    const multihash = await Blake3.digest(input(size))
    const expect = new Uint8Array(34)
    expect[0] = 0x1e
    expect[1] = 32
    expect.set(base16.baseDecode(hash).subarray(0, 32), 2)

    assert.deepEqual(multihash.bytes, expect, "bytes match")
    assert.deepEqual(multihash.digest, expect.subarray(2), "hashes match")

    const bytes = new Uint8Array(164)
    await Blake3.digestInto(input(size), bytes)
    assert.deepEqual(bytes.subarray(0, 34), expect)

    const offset = Math.round(Math.random() * 30)
    Blake3.digestInto(input(size), bytes, offset)
    assert.deepEqual(
      bytes.subarray(offset, offset + 34),
      expect,
      `digestInto at offset ${offset}`
    )

    Blake3.digestInto(input(size), bytes, offset, false)
    assert.deepEqual(
      bytes.subarray(offset, offset + 32),
      expect.subarray(2),
      `digestInto at offset ${offset}`
    )
  }
}

for (const { hash, input_len: size } of vectors) {
  test[`test sync vector ${size} base64`] = async assert => {
    const blake = await Blake3.sync()
    const multihash = blake.digest(input(size))
    const expect = new Uint8Array(34)
    expect[0] = 0x1e
    expect[1] = 32
    expect.set(base16.baseDecode(hash).subarray(0, 32), 2)

    assert.deepEqual(multihash.bytes, expect, "bytes match")
    assert.deepEqual(multihash.digest, expect.subarray(2), "hashes match")

    const bytes = new Uint8Array(164)
    blake.digestInto(input(size), bytes)
    assert.deepEqual(bytes.subarray(0, 34), expect)

    const offset = Math.round(Math.random() * 30)
    blake.digestInto(input(size), bytes, offset)
    assert.deepEqual(
      bytes.subarray(offset, offset + 34),
      expect,
      `digestInto at offset ${offset}`
    )

    blake.digestInto(input(size), bytes, offset, false)
    assert.deepEqual(
      bytes.subarray(offset, offset + 32),
      expect.subarray(2),
      `digestInto at offset ${offset}`
    )
  }
}

test["streaming hasher fuzz"] = async assert => {
  const hasher = await Blake3.stream()
  const blake = await Blake3.sync()

  const size = 102400
  let offset = 0
  while (offset < size) {
    const frameSize = Math.min(Math.round(Math.random() * 1000), size - offset)
    offset += frameSize
    const frame = input(offset).slice(-frameSize)
    hasher.write(frame)
    assert.deepEqual(hasher.count(), BigInt(offset))
    assert.deepEqual(
      hasher.digest().digest.join(""),
      blake.digest(input(offset)).digest.join(""),
      `hasher at offset ${offset - frameSize}..${offset}`
    )
  }
}

/**
 *
 * @param {{raw:readonly string[]}} template
 * @param {unknown[]} substitutions
 * @returns
 */
const b = (template, ...substitutions) =>
  new TextEncoder().encode(String.raw(template, substitutions))

test["streaming hash & reset"] = async assert => {
  const hasher = await Blake3.stream()
  const blake = await Blake3.sync()

  assert.deepEqual(hasher.name, "blake3")
  assert.deepEqual(hasher.code, 0x1e)
  assert.deepEqual(hasher.size, 32)

  const buffer = new Uint8Array(128)

  assert.deepEqual(hasher.write(b`foo`).digest(), blake.digest(b`foo`))

  hasher.digestInto(buffer)
  assert.deepEqual(buffer.subarray(0, 34), blake.digest(b`foo`).bytes)

  buffer.fill(0)
  hasher.digestInto(buffer, 7)
  assert.deepEqual(buffer.subarray(7, 7 + 34), blake.digest(b`foo`).bytes)

  hasher.digestInto(buffer, 2, false)
  assert.deepEqual(buffer.subarray(2, 2 + 32), blake.digest(b`foo`).digest)

  assert.deepEqual(hasher.write(b`bar`).digest(), blake.digest(b`foobar`))

  assert.deepEqual(hasher.write(b`baz`).digest(), blake.digest(b`foobarbaz`))

  hasher.reset()
  assert.deepEqual(hasher.count(), BigInt(0))
  assert.deepEqual(hasher.write(b`bar`).digest(), blake.digest(b`bar`))
  assert.deepEqual(hasher.write(b`foo`).digest(), blake.digest(b`barfoo`))
}

test["dispose stream"] = async assert => {
  const hasher = await Blake3.stream()
  hasher.dispose()

  try {
    hasher.write(b`foo`)
    hasher.digest()
  } catch {
    assert.deepEqual(true, true, "write throws after dispose")
  }
}
