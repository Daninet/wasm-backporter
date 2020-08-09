import fs from 'fs';
import { transform } from './lib/index';

const wasm = fs.readFileSync('./main/main.wasm');
transform(wasm);
