export function consoleSize() {
  if ("consoleSize" in Deno && !("__test_env__" in window)) {
    // @ts-ignore use default if not running unstable
    return Deno.consoleSize(Deno.stdout.rid);
  }
  return { columns: 80, rows: 40 };
}
