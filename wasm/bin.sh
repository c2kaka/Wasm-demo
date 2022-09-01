#!/usr/bin/env bash
emcc ./wasm/dip.cc -s WASM=1 -O3 --no-entry -o ./public/dip.wasm
