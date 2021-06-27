/**
 * LazyInitialize
 * Decorator to lazy initialize a value
 *
 * Example:
 *
 *  class A {
 *    @LazyInitialize
 *    get value() {
 *      return this.filter...
 *    }
 *  }
 *
 */

export function LazyInitialize(
  // deno-lint-ignore no-explicit-any
  target: any,
  key: string,
  descriptor: PropertyDescriptor,
) {
  const { configurable, enumerable, get, value } = descriptor;

  return {
    configurable,
    enumerable,
    get() {
      if (this === target) return;
      const newValue = get ? get.call(this) : value;

      Object.defineProperty(this, key, {
        configurable,
        enumerable,
        writable: true,
        value: newValue,
      });

      return newValue;
    },
  };
}
