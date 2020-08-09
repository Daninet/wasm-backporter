#!/bin/bash

mkdir -p dist

npm run eslint

npx rollup -c
npx tsc ./lib/index --outDir ./dist --emitDeclarationOnly --declaration --resolveJsonModule --allowSyntheticDefaultImports
