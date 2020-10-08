import { arrayMethods } from './array';
import { defineProperty } from '../util';
import Dep from './dep';

class Observer {
  constructor(value) {
    // 使用 defineProperty 重新定义属性

    defineProperty(value, '__ob__', this);

    if (Array.isArray(value)) {
      value.__proto__ = arrayMethods;
      this.observeArray(value);
    } else {
      this.walk(value);
    }
  }

  observeArray(value) {
    value.forEach((item) => {
      observe(item); // 观测数组对象中的属性
    });
  }

  walk(data) {
    const keys = Object.keys(data);
    keys.forEach((key) => {
      defineReactive(data, key, data[key]);
    });
  }
}

function defineReactive(data, key, value) {
  const dep = new Dep();
  observe(value); // 如果当前观察的对象不是简单数据类型继续观测
  Object.defineProperty(data, key, {
    get() {
      if (Dep.target) {
        dep.depend();
      }
      return value;
    },
    set(newValue) {
      if (newValue === value) return;
      observe(newValue); // 如果设置的值也是对象继续观测
      value = newValue;
      dep.notify();
    },
  });
}

export function observe(data) {
  if (data === null || typeof data !== 'object') {
    return;
  }

  if (data.__ob__) {
    return;
  }

  return new Observer(data);
}
