/**
 * 挂载真实节点
 * @param{Element} oldNode 这是之前的节点, 初次渲染时就是 选项 el
 */
export function patch (oldNode, vnode) {
  const el = createElm(vnode);
  const parentNode = oldNode.parentNode; // https://developer.mozilla.org/zh-CN/docs/Web/API/Node/parentNode 获取父节点
  parentNode.insertBefore(el, oldNode.nextSibling); // 插入节点
  parentNode.removeChild(oldNode);
}

function createElm(vnode) {
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

function updateProperties(vnode) {
  const { el, data = {} } = vnode;
  for (let key in data) {
    if (key === 'style') {
      for (let styleName in data[key]) {
        el.style[styleName] = data[key][styleName];
      }
    } else if (key === 'class') {
      el.className = data[key];
    } else {
      el.setAttribute(key, data[key]);
    }
  }
}
