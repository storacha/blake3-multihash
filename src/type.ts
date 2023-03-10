import type {
  MultihashDigest,
  MultihashHasher,
  SyncMultihashHasher,
} from "multiformats"

export interface Digest<Code extends number, Size extends number>
  extends MultihashDigest<Code> {
  size: Size
}

export interface Hasher<Code extends number, Size extends number>
  extends MultihashHasher<Code> {
  size: Size

  /**
   * Computes the digest of the given input and writes it into the given output
   * at the given offset. Unless `asMultihash` is `false` multihash is
   * written otherwise only the digest (without multihash prefix) is written.
   */
  digestInto(
    input: Uint8Array,
    output: Uint8Array,
    offset?: number,
    asMultihash?: boolean
  ): void | Promise<void>
}

export interface SyncHasher<Code extends number, Size extends number>
  extends SyncMultihashHasher<Code> {
  size: Size

  digest(input: Uint8Array): Digest<Code, Size>

  /**
   * Computes the digest of the given input and writes it into the given output
   * at the given offset. Unless `asMultihash` is `false` multihash is
   * written otherwise only the digest (without multihash prefix) is written.
   */
  digestInto(
    input: Uint8Array,
    output: Uint8Array,
    offset?: number,
    asMultihash?: boolean
  ): void
}

export interface StreamingHasher<Code extends number, Size extends number> {
  size: Size
  code: Code
  name: string
  /**
   * Number of bytes currently consumed.
   */
  count(): bigint

  /**
   * Returns multihash digest of the bytes written so far.
   */
  digest(): Digest<Code, Size>

  /**
   * Computes the digest of the given input and writes it into the given output
   * at the given offset. Unless `asMultihash` is `false` multihash is
   * written otherwise only the digest (without multihash prefix) is written.
   */
  digestInto(output: Uint8Array, offset?: number, asMultihash?: boolean): this

  /**
   * Writes bytes to be digested.
   */
  write(bytes: Uint8Array): this

  /**
   * Resets this hasher to its initial state.
   */
  reset(): this

  /**
   * Disposes this hasher and frees up any resources it may be holding on to.
   * After this is called this hasher should not be used.
   */
  dispose(): void
}
