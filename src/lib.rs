#![feature(int_log)]

use blake3::Hasher;
use wasm_bindgen::prelude::*;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
pub struct Stream {
    hasher: Hasher,
}

#[wasm_bindgen]
pub fn create() -> Stream {
    Stream {
        hasher: Hasher::new(),
    }
}

#[wasm_bindgen]
pub fn write(stream: &mut Stream, source: &[u8]) {
    stream.hasher.update(source);
}

#[wasm_bindgen(js_name = readHashInto)]
pub fn read_hash_into(stream: &mut Stream, target: &mut [u8], offset: usize) {
    stream.hasher.finalize_xof().fill(&mut target[offset..]);
}

#[wasm_bindgen]
pub fn count(stream: &mut Stream) -> u64 {
    stream.hasher.count()
}

#[wasm_bindgen]
pub fn reset(stream: &mut Stream) {
    stream.hasher.reset();
}

#[wasm_bindgen(js_name = hashInto)]
pub fn hash_into(input: &[u8], output: &mut [u8], offset: usize) {
    Hasher::new()
        .update(input)
        .finalize_xof()
        .fill(&mut output[offset..]);
}

#[cfg(test)]
mod tests {
    use blake3::Hash;

    use crate::*;
    use std::fs;

    #[test]
    fn test_stream() {
        let mut hasher = Hasher::new();
        hasher.update(b"foo");
        hasher.finalize();
        hasher.update(b"bar");
        let hash = hasher.finalize();
        assert_eq!(
            hash.as_bytes().to_vec(),
            Hasher::new()
                .update(b"foobar")
                .finalize()
                .as_bytes()
                .to_vec()
        );
    }
}
