import { initState } from './state';
import { compileToFunctions } from './compiler/index';
import { mountComponent } from './lifecycle';

export function initMixin(Vue) {
  Vue.prototype._init = function (options) {
    const vm = this;
    vm.$options = options;

    // 初始化状态, 劫持数据, 更新视图
    // vue 响应式数据原理
    initState(vm);

    // 渲染模板
    if (vm.$options.el) {
      vm.$mount(vm.$options.el);
    }
  }

  Vue.prototype.$mount = function (el) {
    const vm = this;
    const options = vm.$options;
    el = document.querySelector(el);

    if (!options.render) {
      let { template } = options;
      if (!template && el) {
        template = el.outerHTML;
      }
      const render = compileToFunctions(template);
      options.render = render;
    }

    // 挂载组件
    mountComponent(vm, el);

  }
}
