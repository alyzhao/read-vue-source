import { observe } from './observer/index';
import { proxy, nextTick } from './util';

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

function initComputed() {}
function initWatch() {}

export function stateMixin(Vue) {
  Vue.prototype.$nextTick = (cb) => {
    nextTick(cb);
  };
}
