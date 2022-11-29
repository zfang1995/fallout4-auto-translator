import jetpack from 'fs-jetpack';
import { TextEncoder, TextDecoder, EncodingIndexes, getEncoding } from 'text-decoding';

console.log(
  new TextDecoder('utf-8')
  .decode(
    new TextEncoder('windows-1252', { NONSTANDARD_allowLegacyEncoding: true })
      .encode(
        jetpack.read('FlirtyCommonwealth.json')
      )
  )
)