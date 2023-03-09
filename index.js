import blake3 from 'blake3'
import { from } from 'multiformats/hashes/hasher'

await blake3.load()

export default from({
  name: 'blake3',
  code: 0x1e,
  encode: input => blake3.hash(input)
})


