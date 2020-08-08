import fs from 'fs';
import { transform } from './lib/index';

const wasm = fs.readFileSync('./demo/argon2.wasm');
transform(wasm);
