import { arrayMethods } from './array';
import { defineProperty } from '../util';
import Dep from './dep';

// 现在需要在操作数组的时候能够更新视图
class Observer {
  constructor(value) {
    // 使用 defineProperty 重新定义属性
    this.dep = new Dep(); // 给每个属性加一个 dep 属性, 这样数组在更新的时候可以更新视图
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
  const childObserver = observe(value); // 如果当前观察的对象不是简单数据类型继续观测
  Object.defineProperty(data, key, {
    get() {
      if (Dep.target) {
        dep.depend();
        if (childObserver) { // 如果有返回值说明观测的对象不是简单数据类型, 有可能是数组也有可能是对象
          childObserver.dep.depend(); // 这里主要是数组可以调用 __ob__.dep 上的 notify 来更新视图
        }
      }
      // 这不是每个 value 都会加上 dep 么 根本没必要判断这个

      console.log('childObserver', childObserver.dep);

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
