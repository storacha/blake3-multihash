/* tslint:disable */
/* eslint-disable */
/**
* @returns {Stream}
*/
export function create(): Stream;
/**
* @param {Stream} stream
* @param {Uint8Array} source
*/
export function write(stream: Stream, source: Uint8Array): void;
/**
* @param {Stream} stream
* @param {Uint8Array} target
* @param {number} offset
*/
export function readHashInto(stream: Stream, target: Uint8Array, offset: number): void;
/**
* @param {Stream} stream
* @returns {bigint}
*/
export function count(stream: Stream): bigint;
/**
* @param {Stream} stream
*/
export function reset(stream: Stream): void;
/**
* @param {Uint8Array} input
* @param {Uint8Array} output
* @param {number} offset
*/
export function hashInto(input: Uint8Array, output: Uint8Array, offset: number): void;
/**
*/
export class Stream {
  free(): void;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_stream_free: (a: number) => void;
  readonly create: () => number;
  readonly write: (a: number, b: number, c: number) => void;
  readonly readHashInto: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly count: (a: number) => number;
  readonly reset: (a: number) => void;
  readonly hashInto: (a: number, b: number, c: number, d: number, e: number, f: number) => void;
  readonly __wbindgen_malloc: (a: number) => number;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {SyncInitInput} module
*
* @returns {InitOutput}
*/
export function initSync(module: SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {InitInput | Promise<InitInput>} module_or_path
*
* @returns {Promise<InitOutput>}
*/
export default function init (module_or_path?: InitInput | Promise<InitInput>): Promise<InitOutput>;
declare function activate(): ReturnType<typeof init>
