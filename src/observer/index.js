class Observer {
  constructor(value) {
    // 使用 defineProperty 重新定义属性



    this.walk(value);
  }

  walk(data) {
    const keys = Object.keys(data);
    keys.forEach((key) => {
      defineReactive(data, key, data[key]);
    });
  }
}

function defineReactive(data, key, value) {
  observe(value); // 如果当前观察的对象不是简单数据类型继续观测
  Object.defineProperty(data, key, {
    get() {
      console.log('get: ' + key, value);
      return value;
    },
    set(newValue) {
      console.log('set: ' + key, newValue);
      if (newValue === value) return;
      observe(newValue); // 如果设置的值也是对象继续观测
      value = newValue;
    },
  });
}

export function observe(data) {
  if (data === null || typeof data !== 'object') {
    return;
  }

  return new Observer(data);
}
