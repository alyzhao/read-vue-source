let id = 0;

export default class Dep {
  constructor() {
    this.subs = []; // 存放 watcher, 每个属性会初始化一个 dep, dep 上存放 watcher
    this.id = id++;
  }

  depend() {
    Dep.target.addDep(this); // 实现 Dep 和 watcher 双向绑定
  }

  addSub(watcher) {
    this.subs.push(watcher);
  }

  notify() {
    console.log(this);
    this.subs.forEach(watcher => {
      watcher.update();
    });
  }
}

Dep.target = null;
const stack = []; // watch 栈, 用于当有 computed watcher 和 渲染 watcher 时, dep 只收集了 computed watcher 的情况
// 这样能剔除掉在 data 中但是没有用在试图渲染中的属性
export function pushTarget(watcher) {
  stack.push(watcher);
  Dep.target = watcher;
}

export function popTarget() {
  stack.pop();
  Dep.target = stack[stack.length - 1] ? stack[stack.length - 1] : null;
}
