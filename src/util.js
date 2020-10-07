export function proxy(vm, dataKey, key) {
  Object.defineProperty(vm, key, {
    get() {
      return vm[dataKey][key];
    },
    set(newValue) {
      vm[dataKey][key] = newValue;
    }
  });
}

export function defineProperty(target, key, value) {
  Object.defineProperty(target, key, {
    enumerable: false,
    configurable: false,
    value,
  });
}
