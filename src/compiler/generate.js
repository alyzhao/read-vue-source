const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g; // 匹配大括号中的内容

function genProps(attrs) {
  let str = '';
  for (let i = 0; i < attrs.length; i++) {
    const attr = attrs[i];
    if (attr.name === 'style') {
      const styles = {};
      attr.value.split(';').forEach((styleStr) => {
        if (styleStr) {
          const [stylePoperty, styleValue] = styleStr.split(':');
          styles[stylePoperty.trim()] = styleValue.trim();
        }
      });
      attr.value = styles
    }
    str += `${attr.name}:${JSON.stringify(attr.value)},`
  }

  return `{${str.slice(0, -1)}}`
}

function gen(node) {
  if (node.type === 1) {
    return generate(node);
  } else {
    const { text } = node;

    if (!defaultTagRE.test(text)) {
      // 如果文本中不带大括号 直接 return
      return `_v(${JSON.stringify(text)})`;
    }

    const tokens = [];
    let lastIndex = defaultTagRE.lastIndex = 0;
    let match, index;

    while (match = defaultTagRE.exec(text)) {
      index = match.index;
      if (index > lastIndex) {
        // 把大括号之前的普通文本放入 tokens
        tokens.push(JSON.stringify(text.slice(lastIndex, index)));
      }
      tokens.push(`_s(${match[1].trim()})`); // 把大括号中的属性加进去
      lastIndex = index + match[0].length; // lastIndex 从结尾大括号}}开始匹配
    }

    // 如果匹配完大括号之后还有剩余字符串则全部放如 tokens
    if (lastIndex < text.length) {
      tokens.push(JSON.stringify(text.slice(lastIndex)));
    }

    return `_v(${tokens.join('+')})`;
  }
}

function genChildren(el) {
  const children = el.children;
  if (children) {
    return children.map((child) => gen(child)).join(',');
  }
}

/**
 * @params el ast 树对象
 */
export function generate(el) {
  const children = genChildren(el);

  let code = `_c('${el.tag}',${
    el.attrs.length ? `${genProps(el.attrs)}` : 'undefined'
  }${
    children ? `,${children}` : ''
  })`;

  return code;
}

