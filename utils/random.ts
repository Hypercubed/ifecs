import MersenneTwister from "https://deno.land/x/mersenne_twister@0.0.6/mod.ts";

// Singleton  // TODO: make a @service
export const prng = new MersenneTwister();
