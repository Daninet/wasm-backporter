const { transform } = require('./lib/index');
const fs = require('fs');
const wasm = fs.readFileSync('./magick.wasm');

console.time('transform');
transform(wasm);
console.timeEnd('transform');

console.time('transform');
transform(wasm);
console.timeEnd('transform');

console.time('transform');
transform(wasm);
console.timeEnd('transform');
