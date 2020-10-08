import { initState } from './state';
import { compileToFunctions } from './compiler/index';
import { mountComponent, callhook } from './lifecycle';
import { mergeOptions } from './util';

export function initMixin(Vue) {
  Vue.prototype._init = function (options) {
    const vm = this;

    // 将用户自定义的options和Vue全局的options合并
    // 如果是在子组件当中, 不应该是 Vue.options 和 当前的 options 合并, 所以合并的是 vm.constructor.options
    vm.$options = mergeOptions(vm.constructor.options, options);

    callhook(vm, 'beforeCreate');

    // 初始化状态, 劫持数据, 更新视图
    // vue 响应式数据原理
    initState(vm);

    callhook(vm, 'created');

    // 渲染模板
    if (vm.$options.el) {
      vm.$mount(vm.$options.el);
    }
  }

  Vue.prototype.$mount = function (el) {
    const vm = this;
    const options = vm.$options;
    el = document.querySelector(el);
    vm.$el = el; // 将 el 赋值给 vm.$el 是为了第一次挂载真实节点时可以传入 oldNode

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
