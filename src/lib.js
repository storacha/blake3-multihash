import { hashInto } from "../gen/wasm.js"
import * as Blake3 from "../gen/wasm.js"
import * as API from "./type.js"
export * from "./type.js"

export const code = 0x1e
export const size = 32
export const name = "blake3"

let loaded = false

/**
 * @param {Uint8Array} input
 */
export const digest = input =>
  loaded ? unsafeDigest(input) : sync().then(() => unsafeDigest(input))

/**
 * @param {Uint8Array} input
 * @param {Uint8Array} output
 * @param {number} [offset=0]
 * @param {boolean} [asMultihash=true]
 */
export const digestInto = (input, output, offset = 0, asMultihash = true) =>
  loaded
    ? unsafeDigestInto(input, output, offset, asMultihash)
    : /* c8 ignore next */
      sync().then(() => unsafeDigestInto(input, output, offset, asMultihash))

export const stream = () =>
  loaded
    ? unsafeStream()
    : /* c8 ignore next */
      sync().then(() => unsafeStream())

/**
 * @returns {Promise<API.SyncHasher<typeof code, 32>>}
 */
export const sync = async () => {
  if (!loaded) {
    await Blake3.activate()
    loaded = true
  }
  return {
    code,
    size,
    name,
    digest: unsafeDigest,
    digestInto: unsafeDigestInto,
  }
}

/**
 * @param {Uint8Array} input
 * @returns {API.Digest<typeof code, 32>}
 */
const unsafeDigest = input => {
  const bytes = new Uint8Array(size + 2)
  bytes[0] = code
  bytes[1] = size
  hashInto(input, bytes, 2)

  return { code, size, bytes, digest: bytes.subarray(2) }
}

/**
 * @param {Uint8Array} input
 * @param {Uint8Array} output
 * @param {number} [offset=0]
 * @param {boolean} [asMultihash=true]
 */
const unsafeDigestInto = (input, output, offset = 0, asMultihash = true) => {
  if (asMultihash) {
    output[offset++] = code
    output[offset++] = size
  }
  hashInto(input, output, offset)
}

/**
 * @returns {API.StreamingHasher<typeof code, 32>}
 */
const unsafeStream = () => new Hasher()

class Hasher {
  constructor() {
    this.id = Blake3.create()
  }
  get name() {
    return name
  }

  /** @type {typeof code} */
  get code() {
    return code
  }
  /** @type {typeof size} */
  get size() {
    return size
  }

  count() {
    return Blake3.count(this.id)
  }

  reset() {
    Blake3.reset(this.id)
    return this
  }

  dispose() {
    this.id.free()
  }

  /**
   * @param {Uint8Array} input
   */
  write(input) {
    Blake3.write(this.id, input)
    return this
  }

  /**
   * @returns {API.Digest<typeof code, 32>}
   */
  digest() {
    const bytes = new Uint8Array(size + 2)
    bytes[0] = code
    bytes[1] = size
    Blake3.readHashInto(this.id, bytes, 2)

    return { code, size, bytes, digest: bytes.subarray(2) }
  }

  /**
   * @param {Uint8Array} output
   * @param {number} [offset=0]
   * @param {boolean} [asMultihash=true]
   */
  digestInto(output, offset = 0, asMultihash = true) {
    if (asMultihash) {
      output[offset++] = code
      output[offset++] = size
    }
    Blake3.readHashInto(this.id, output, offset)

    return this
  }
}
