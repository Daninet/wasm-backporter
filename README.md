# wasm-backporter
It backports post-MVP WASM features to older instructions, so older browsers can also execute them.
This is similar to what is Babel.js doing for JavaScript, but this library it's intended to run on client-side.


It is designed to be very fast and lightweight: It directly operates on WASM binary files without transforming them back to WAT or other representations.

## Why is it useful

* We have a lot of post-MVP WASM features, but the browser support is lagging behind. Also there are differences in features supported in different browsers. [WebAssembly roadmap](https://webassembly.org/roadmap/)

* Thus, in order to archive compatibility with all browsers, the binaries had to be compiled without any post-MVP features, which lead to sub-optimal performance.

* With `wasm-backporter` you can compile your binary with the latest post-MVP features (SIMD instructions, bulk memory operations, etc.). You only have to bundle a single WASM binary in npm packages, so it keeps the bundle size low. This library can be used to quickly backport the feautres, which are unavailable in the current environment just before execution.

## Status

⚠️ WARNING: Currently it's only a alpha version with a few instructions implemented from bulk memory operations proposal. Even if it generates a valid WASM file, it is **NOT** guaranteed that the output will run correctly.


Feature                               | Status
--------------------------------------|---------------------------
Bulk memory operations                | ⏳ Almost finished
Fixed-width SIMD                      | ⏳ In development
Sign-extension operations             | 📅 Planned
Exception handling                    | 📅 Planned
Non-trapping float-to-int conversions | 📅 Planned



## Contributions

Contributions are greatly appreciated. There are a lot of instructions, which need backporting. Feel free to contact me if you want to help.

## Usage

```javascript

import { transform } from 'wasm-backporter';

import wasmUint8Array from './calculator.wasm';

async function calculate() {
  const backportedBinary = transform(wasmUint8Array);
  const { instance } = await WebAssembly.instantiate(backportedBinary);
  return instance.exports.calculate(1, 6);
}

calculate();

```

## API

```typescript

function transform(wasm: Uint8Array, options: ITransformOptions = {}): Uint8Array

```
