export function renderMixin(Vue) {
  // 创建元素
  Vue.prototype._c = function () {
    return createElement(...arguments);
  }

  // JSON.stringify
  Vue.prototype._s = function (val) {
    return val === null
      ? ''
      : typeof val === 'object'
        ? JSON.stringify(val)
        : val;
  }

  // 创建文本元素
  Vue.prototype._v = function (text) {
    return createTextVnode(text);
  }

  Vue.prototype._render = function () {
    const vm = this;
    const render = vm.$options.render;
    const vnode = render.call(vm);
    return vnode;
  }
}

/**
 * 创建元素节点
 * @param {String} tag 标签名
 * @param {Data} 属性对象
 */
function createElement(tag, data={}, ...children) {
  return vnode(tag, data, data.key, children);
}

function createTextVnode(text) {
  console.log('createTextVnode', text);
  return vnode(undefined, undefined, undefined, undefined, text);
}

/**
 * 创建虚拟节点
 * @param{Data} 节点上的属性对象
 */
function vnode(tag, data, key, children, text) {

  // 和 ast 不同的是 虚拟节点可以添加一些自定义的属性比如 slot 等
  return {
    tag,
    data,
    key,
    children,
    text,
    // componentsInstance: '',
    // slot: '',
  };
}
