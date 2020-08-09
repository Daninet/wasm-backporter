const fs = require('fs');
const wasm = fs.readFileSync('out.wasm');

async function run() {
  for (let i = 0; i < 1000; i++) {
    const instance = await WebAssembly.instantiate(wasm);
    const view = new Uint8Array(instance.instance.exports.memory.buffer);
    for (let i = 0; i < 10; i++) {
      view[i] = 10 + i;
    }
    debugger;
    console.log(instance.instance.exports.copy(1, 6, 4));
  }
}

run();
