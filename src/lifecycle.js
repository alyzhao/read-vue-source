import { patch } from './vdom/patch';
import Watcher from './observer/watcher';

export function lifecycleMixin(Vue) {
  Vue.prototype._update = function (vnode) {
    const vm = this;

    const prevVnode = vm._vnode;

    // 初次渲染时还没有 vnode 给 vm 加上 _vnode 属性目的是为了之后的渲染传入 vnode 用来做 diff, 优化性能
    if (!prevVnode) {
      // 以前的 $el 已经被删除掉了, 这里需要重新赋值, 否则在每次更新的时候还是拿到的以前的 el
      vm.$el = patch(vm.$el, vnode);
    } else {
      vm.$el = patch(prevVnode, vnode);
    }
    vm._vnode = vnode;
  }
}

export function mountComponent(vm, el) {
  callhook(vm, 'beforeMount');

  const updateComponent = () => {
    vm._update(vm._render());
  }
  // 通过 new Watcher 来调用 挂载的方法
  // 调用 render 方法去渲染 el
  // 先调用 render 创建虚拟节点, 再将虚拟节点渲染到页面上
  const watcher = new Watcher(vm, updateComponent, () => {
    callhook(vm, 'updated'); // 初次渲染的时候不应该调用 beforeUpdate 生命周期函数
  }, { user: false });
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
