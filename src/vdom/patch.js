/**
 * 挂载真实节点
 * @param{Element} oldNode 这是之前的节点, 初次渲染时就是 选项 el
 */
export function patch (oldNode, vnode) {
  // 如果 nodeType 是 1 那么他是一个 Dom 元素也就是初次挂载的时候那么按照原来的流程执行即可

  if (oldNode.nodeType === 1) {
    const el = createElm(vnode);
    const parentNode = oldNode.parentNode; // https://developer.mozilla.org/zh-CN/docs/Web/API/Node/parentNode 获取父节点
    parentNode.insertBefore(el, oldNode.nextSibling); // 插入节点
    parentNode.removeChild(oldNode);
    return el;
  } else {
    // 这里来 diff 前后的虚拟节点, 在更新视图时
    const oldEl = oldNode.el;

    if (oldNode.tag !== vnode.tag) {
      const el = createElm(vnode);
      oldEl.parentNode.replaceChild(el, oldEl);
      return el;
    } else if (!oldNode.tag) {
      // 都是文本节点, 对比文本内容是否一样, 不一样的话替换掉老的 dom 文本
      if (oldNode.text !== vnode.text) {
        oldEl.textContext = vnode.text;
      }
      return oldEl;
    } else {
      // 标签一样需要比较属性和子元素, 此时复用老节点
      const el = vnode.el = oldNode.el; // 此时当前虚拟节点的el用原来虚拟节点的el即可
      updateProperties(vnode, oldNode.data);

      // 开始处理子元素
      const oldChildren = oldNode.children || [];
      const newChildren = vnode.children || [];

      if (oldChildren.length && newChildren.length) {
        // 如果都有子元素那么则需要对比新旧节点的子元素
        updateChildren(oldChildren, newChildren, el);
      } else if (newChildren.length) {
        newChildren.forEach((child) => {
          el.appendChild(createElm(child));
        });
      } else {
        el.innerHTML = '';
      }
      return el;
    }
  }
}

/**
 *
 */
function isSameVnode(oldVnode, newVnode) {
  return oldVnode.tag === newVnode.tag && oldVnode.key === newVnode.key;
}

/**
 * 对比新旧虚拟节点子元素
 * 创建四个节点去比较
 */
function updateChildren(oldChildren, newChildren, parent) {
  let oldStartIndex = 0;
  let oldStartVnode = oldChildren[oldStartIndex];
  let oldEndIndex = oldChildren.length - 1;
  let oldEndVnode = oldChildren[oldEndIndex];

  let newStartIndex = 0;
  let newStartVnode = newChildren[newStartIndex];
  let newEndIndex = newChildren.length - 1;
  let newEndVnode = newChildren[newEndIndex];

  /**
   * 把子元素的节点的 key 和 index 做一个映射
   */
  function makeIndexByKey(children) {
    const result = {};
    children.forEach((child, index) => {
      if (child.key !== undefined) {
        result[child.key] = index;
      }
    });

    return result;
  }

  const map = makeIndexByKey(oldChildren);

  while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
    if (!oldStartVnode) {
      // 如果为null则跳过, 节点已经被移动过
      oldStartVnode = oldChildren[++oldStartIndex];
    } else if (!oldEndVnode) {
      // 如果从后往前比发现为 null, 那么跳过并向前移动一个位置
      oldEndVnode = oldChildren[--oldEndIndex];
    } else if (isSameVnode(oldStartVnode, newStartVnode)) {
      patch(oldStartVnode, newStartVnode);
      oldStartVnode = oldChildren[++oldStartIndex];
      newStartVnode = newChildren[++newStartIndex];
    } else if (isSameVnode(oldEndVnode, newEndVnode)) {
      patch(oldEndVnode, newEndVnode);
      oldEndVnode = oldChildren[--oldEndIndex];
      newEndVnode = newChildren[--newEndIndex];
    } else if (isSameVnode(oldStartVnode, newEndVnode)) {
      patch(oldStartVnode, newEndVnode);
      parent.insertBefore(oldStartVnode.el, oldEndVnode.el.nextSibling || null);
      oldStartVnode = oldChildren[++oldStartIndex];
      newEndVnode = newChildren[--newEndIndex];
    } else if (isSameVnode(oldEndVnode, newStartVnode)) {
      patch(oldEndVnode, newStartVnode);
      parent.insertBefore(oldEndVnode.el, oldStartVnode.el);
      oldEndVnode = oldChildren[--oldEndIndex];
      newStartVnode = newChildren[++newStartIndex];
    } else {
      // 暴力对比
      const moveIndex = map[newStartVnode.key];
      if (moveIndex === undefined) {
        // 此时新的子元素没有可以复用的旧子元素
        parent.insertBefore(createElm(newStartVnode), oldStartVnode.el);
      } else {
        const moveVnode = oldChildren[moveIndex];
        parent.insertBefore(moveVnode.el, oldStartVnode.el);
        oldChildren[moveIndex] = null;
        patch(moveVnode, newStartVnode);
      }
      newStartVnode = newChildren[++newStartIndex];
    }
  }

  if (newStartIndex <= newEndIndex) {
    // 新的节点有多的话直接插入头或者尾
    // 如果是从前往后比较的话直接插入到末尾
    // 如果是从后往前比较的话直接插入到开头 newChildren[newEndIndex + 1].el 此时头节点是创建过的
    const ele = newChildren[newEndIndex + 1] ? newChildren[newEndIndex + 1].el : null;
    for (let i = newStartIndex; i <= newEndIndex; i++) {
      parent.insertBefore(createElm(newChildren[i]), ele);
    }
  }

  if (oldStartIndex <= oldEndIndex) {
    // 说明老的节点有多的
    for (let i = oldStartIndex; i <= oldEndIndex; i++) {
      // 如果老的节点为 null 那么之前已经被移动过了不需要处理否则删除
      if (oldChildren[i]) {
        parent.removeChild(oldChildren[i].el);
      }
    }
  }
}

export function createElm(vnode) {
  const {
    tag,
    data,
    key,
    children,
    text,
  } = vnode;

  if (typeof tag === 'string') {
    vnode.el = document.createElement(tag);
    updateProperties(vnode);
    children.forEach((item) => {
      vnode.el.appendChild(createElm(item));
    });
  } else {
    vnode.el = document.createTextNode(text);
  }
  return vnode.el;
}

function updateProperties(vnode, oldProps = {}) {
  const {
    el,
    data: newProps = {},
  } = vnode;

  for (let key in oldProps) {
    if (!newProps[key]) {
      el.removeAttribute(key);
    }
  }

  const newStyle = newProps.style;
  const oldStyle = oldProps.style;

  for (let key in oldStyle) {
    if (!newStyle[key]) {
      el.style[key] = '';
    }
  }

  for (let key in newProps) {
    if (key === 'style') {
      for (let styleName in newProps[key]) {
        el.style[styleName] = newProps[key][styleName];
      }
    } else if (key === 'class') {
      el.className = newProps[key];
    } else {
      el.setAttribute(key, newProps[key]);
    }
  }
}
