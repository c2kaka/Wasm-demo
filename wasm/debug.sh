#!/usr/bin/env bash
emcc ./wasm/dip.cc -g4 -s WASM=1 -O3 --no-entry -o ./wasm/dip.wasm
