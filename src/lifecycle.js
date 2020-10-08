import { patch } from './vdom/patch';

export function lifecycleMixin(Vue) {
  Vue.prototype._update = function (vnode) {
    const vm = this;
    patch(vm.$el, vnode);
  }
}

export function mountComponent(vm, el) {
  callhook(vm, 'beforeMount');

  // 调用 render 方法去渲染 el
  // 先调用 render 创建虚拟节点, 再将虚拟节点渲染到页面上
  vm._update(vm._render());

  callhook(vm, 'mounted');
}

/**
 * 调用实例生命周期 handler
 * @param{String} hook 生命周期名称
 */
export function callhook(vm, hook) {
  const handler = vm.$options[hook];

  if (!handler) return;

  for (let i = 0, l = handler.length; i < l; i ++) {
    handler[i].call(vm); // 生命周期中的 this 都是指向 Vue 实例
  }
}
