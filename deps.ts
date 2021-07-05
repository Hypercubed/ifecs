import "https://cdn.pika.dev/@abraham/reflection@^0.7.0";

export { Event as Signal } from "https://deno.land/x/subscription@2.0.1/mod.ts";
export { default as escapeRegex } from "https://unpkg.com/escape-string-regexp@5.0.0/index.js";
export * from "https://deno.land/x/reflect_metadata@v0.1.12/mod.ts";
export { default as wrap } from "https://deno.land/x/word_wrap@v0.1.1/mod.ts";
export * from "https://deno.land/x/mersenne_twister@0.0.6/mod.ts";
export * from "https://raw.githubusercontent.com/Hypercubed/deno_di/master/mod.ts";

// @deno-types="https://unpkg.com/compromise@13.11.2/types/index.d.ts"
import { default as nlp } from "https://unpkg.com/compromise@13.11.2/builds/compromise.mjs";
import { default as numbers } from "https://unpkg.com/compromise-numbers@1.3.0/builds/compromise-numbers.mjs";

nlp.extend(numbers);

export { nlp };
