const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`; // 匹配标签名
const qnameCapture = `((?:${ncname}\\:)?${ncname})`; // 捕获标签名
const startTagOpen = new RegExp(`^<${qnameCapture}`); // 标签开头的正则 捕获的内容是标签名
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`); // 匹配标签结尾的 </div>
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // 匹配属性的
const startTagClose = /^\s*(\/?)>/; // 匹配标签结束的 >
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g; // 匹配大括号中的内容

export function parseHTML(html) {
  function createASTElement(tagName, attrs) {
    return {
      tag: tagName,
      type: 1, // 元素 element
      children: [],
      attrs,
      parent: null,
    };
  }

  let root;
  let currentParent;
  let stack = []; // 用于存放当前处理的节点, 存放之后在匹配到结尾标签时进行比较

  function start(tagName, attrs) {
    let element = createASTElement(tagName, attrs);
    if (!root) {
      root = element;
    }
    currentParent = element; // 当前解析的标签 保存起来
    stack.push(element);
  }

  function end(tagName) {
    // 在结尾标签处创建父子关系
    let element = stack.pop();
    currentParent = stack[stack.length - 1];
    if (currentParent) {
      element.parent = currentParent;
      currentParent.children.push(element);
    }
  }

  function chars(text) {
    text = text.trim();
    if (text) {
      // 将文本类型的子元素 push
      currentParent.children.push({
        type: 3, // 文本类型元素
        text,
      });
    }
  }

  while(html) {
    const textEnd = html.indexOf('<');
    if (textEnd === 0) {
      // 如果是标签的开头
      const startTagMatch = parseStartTag();
      if (startTagMatch) {
        start(startTagMatch.tagName, startTagMatch.attrs);
        continue;
      }

      const endTagMatch = html.match(endTag);
      if (endTagMatch) {
        // 处理结束标签
        advance(endTagMatch[0].length);
        end(endTagMatch[1]); // 将结束标签传入
        continue;
      }
    }

    let text;
    if (textEnd > 0) {
      text = html.substring(0, textEnd);
    }

    if (text) {
      chars(text);
      advance(text.length);
    }
  }

  function advance(n) {
    html = html.substring(n);
  }
  // 12:26
  function parseStartTag() {
    const start = html.match(startTagOpen);
    if (start) {
      const match = {
        tagName: start[1],
        attrs: [],
      };
      advance(start[0].length);
      let end;
      let attr;
      // 不是结尾标签 并且能匹配到属性
      while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
        match.attrs.push({
          name: attr[1],
          value: attr[3] || attr[4] || attr[5],
        });
        advance(attr[0].length);
      }

      if (end) {
        // 开始标签结束
        advance(end[0].length);
        return match;
      }
    }
  }

  return root;
}
