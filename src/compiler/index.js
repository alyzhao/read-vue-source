import { parseHTML } from './parse';
import { generate } from './generate';

// 将template转换成render函数
export function compileToFunctions (template) {
  // 1. 生成 ast 树
  const ast = parseHTML(template);
  console.log('ast', ast);

  // 2. 优化静态节点

  // 3. 根据 ast 树 生成 render 代码
  const code = generate(ast);
  console.log(code);

  // 4. 将字符串变成函数

  // 大括号中会有一些变量, 这里通过 with 改变作用域, 变量从 this 中去取
  // 在外部调用的时候只需要在调用函数的时候改变 this 指向即可
  const render = new Function(`with(this) { return ${code}; }`);
  return render;
}
