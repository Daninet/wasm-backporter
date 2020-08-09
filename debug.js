const fs = require('fs');
const wasm = fs.readFileSync('out.wasm');

async function run() {
  for (let i = 0; i < 1000; i++) {
    const instance = await WebAssembly.instantiate(wasm);
    debugger;
    console.log(instance.instance.exports.fill(0, 0xBE, 16));
  }
}

run();
