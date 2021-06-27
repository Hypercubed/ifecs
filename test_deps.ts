export * from "https://deno.land/std@0.97.0/testing/asserts.ts";
export * from "https://deno.land/x/mock@v0.9.5/mod.ts";
export * from "https://deno.land/std@0.97.0/fmt/colors.ts";

// @ts-ignore Disable some cursor features that don't work well in tests
window.__test_env__ = true;
