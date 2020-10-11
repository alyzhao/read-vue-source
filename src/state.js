import { observe } from './observer/index';
import { proxy, nextTick } from './util';
import Watcher from './observer/watcher';
import Dep from './observer/dep';

export function initState(vm) {
  const opts = vm.$options;

  if (opts.props) {
    initProps(vm);
  }

  if (opts.methods) {
    initMethods(vm);
  }

  if (opts.data) {
    initData(vm);
  }

  if (opts.computed) {
    initComputed(vm);
  }

  if (opts.watch) {
    initWatch(vm);
  }
}

function initProps() {}
function initMethods() {}

function initData(vm) {
  let data = vm.$options.data;
  data = typeof data === 'function' ? data.call(vm) : data;
  vm._data = data;

  for (let key in data) {
    // 将实例 _data 中的属性代理到实例属性上
    proxy(vm, '_data', key);
  }

  // 数据的劫持方案 Object.defineProperty
  // 数组单独处理
  observe(data);
}

function initComputed(vm) {
  const { computed } = vm.$options;
  const watchers = vm._computedWatchers = {}; // 给每个计算属性的key加上一个 watcher
  // 这样在获取 data 上的值时, data上的值时会自动得将 watcher 保存起来
  // 在 data 上得值改变时, 只要调用对应 watcher 上的方法就能更新 computed
  for (let key in computed) {
    const userDef = computed[key];
    const getter = typeof userDef === 'function' ? userDef : userDef.get;
    watchers[key] = new Watcher(vm, getter, () => {}, { lazy: true });
    defineComputed(vm, key, userDef);
  }
}

function defineComputed(target, key, userDef) {
  const sharePropertyDefinition = {
    enumerable: true,
    configurable: true,
    get: () => {},
    set: () => {},
  };
  if (typeof userDef === 'function') {
    sharePropertyDefinition.get = createComputedGetter(key);
  } else {
    sharePropertyDefinition.get = createComputedGetter(key);
    sharePropertyDefinition.set = userDef.set;
  }

  Object.defineProperty(target, key, sharePropertyDefinition);
}

function createComputedGetter(key) {
  return function() {
    const watcher = this._computedWatchers[key];
    if (watcher && watcher.dirty) {
      watcher.evaluate();
      if (Dep.target) {
        watcher.depend();
      }
    }
    return watcher.value;
  }
}

function initWatch(vm) {
  const { watch } = vm.$options;
  for (var key in watch) {
    const handler = watch[key];
    if (Array.isArray(handler)) {
      handler.forEach((handle) => {
        createWatcher(vm, key, handle);
      });
    } else {
      createWatcher(vm, key, handler);
    }
  }
}

function createWatcher(vm, exprOrFn, handler, options = {}) {
  if (typeof handler === 'object' && handler !== null) {
    handler = handler.handler;
    options = handler;
  }

  if (typeof handler === 'string') {
    handler = vm[handler];
  }

  vm.$watch(exprOrFn, handler, options);
}

export function stateMixin(Vue) {
  Vue.prototype.$nextTick = (cb) => {
    nextTick(cb);
  };

  Vue.prototype.$watch = function (exprOrFn, cb, options = {}) {
    const watch = new Watcher(this, exprOrFn, cb, { ...options, user: true })
    if (options.immediate) {
      cb();
    }
  };
}
