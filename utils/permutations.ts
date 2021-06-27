export function allPossibleCases(
  // deno-lint-ignore no-explicit-any
  array: any[],
  // deno-lint-ignore no-explicit-any
  result?: any[],
  index = 0,
  // deno-lint-ignore no-explicit-any
): any[] {
  if (!result) {
    result = [];
    index = 0;
    // @ts-ignore array
    array = array.map((element) => {
      return Array.isArray(element) ? element : [element];
    });
  }
  if (index < array.length) {
    // @ts-ignore this
    array[index].forEach((element) => {
      var a = array.slice(0);
      a.splice(index, 1, [element]);
      allPossibleCases(a, result, index + 1);
    });
  } else {
    result.push(array);
  }

  return result;
}
