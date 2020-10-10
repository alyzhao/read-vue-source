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
  } else {
    // 这里来 diff 前后的虚拟节点, 在更新视图时
    const oldEl = oldNode.el;

    if (oldNode.tag !== vnode.tag) {
      const el = createElm(vnode);
      oldEl.parentNode.replaceChild(el, oldEl);
    } else if (!oldNode.tag) {
      // 都是文本节点, 对比文本内容是否一样, 不一样的话替换掉老的 dom 文本
      if (oldNode.text !== vnode.text) {
        oldEl.textContext = vnode.text;
      }
    } else {
      // 标签一样需要比较属性和子元素, 此时复用老节点
      const el = vnode.el = oldNode.el; // 此时当前虚拟节点的el用原来虚拟节点的el即可
      updateProperties(vnode, oldNode.data);
    }
  }

  return el;
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
