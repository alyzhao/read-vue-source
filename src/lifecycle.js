export function lifecycleMixin(Vue) {
  Vue.prototype._update = function (vnode) {
    console.log('vnode', vnode);
  }
}

export function mountComponent(vm, el) {
  // 调用 render 方法去渲染 el

  // 先调用 render 创建虚拟节点, 再将虚拟节点渲染到页面上
  vm._update(vm._render());
}
