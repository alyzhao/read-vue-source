import { initState } from './state';

export function initMixin(Vue) {
  Vue.prototype._init = function (options) {
    const vm = this;
    vm.$options = options;

    // 初始化状态, 劫持数据, 更新视图
    // vue 响应式数据原理
    initState(vm);
  }
}
