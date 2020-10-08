export default class Dep {
  constructor() {
    this.subs = []; // 存放 watcher, 每个属性会初始化一个 dep, dep 上存放 watcher
  }

  depend() {
    this.subs.push(Dep.target);
  }

  notify() {
    this.subs.forEach(watcher => {
      watcher.update();
    });
  }
}

Dep.target = null;

// 这样能剔除掉在 data 中但是没有用在试图渲染中的属性
export function pushTarget(watcher) {
  Dep.target = watcher;
}

export function popTarget() {
  Dep.target = null;
}
