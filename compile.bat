del wasm\snowflake.js
del wasm\snowflake.wasm
em++ main.cpp -s EXPORT_ES6 -s WASM_BIGINT -s WASM=1 -s EXPORT_ALL=1 -o wasm\snowflake.js -std=c++23 || exit 1
