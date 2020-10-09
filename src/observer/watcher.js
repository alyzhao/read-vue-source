import { pushTarget, popTarget } from './dep';

let id = 0; // 标识每个 watcher 实例

export default class Watcher {
  /**
   * @param{Boolean} options 是否是更新试图
   */
  constructor(vm, exprOrFn, cb, options) {
    this.vm = vm;
    this.exprOrFn = exprOrFn
    this.cb = cb;
    this.options = options;
    this.id = id++;

    this.deps = [];
    this.depIds = new Set();

    if (typeof exprOrFn === 'function') {
      this.getter = exprOrFn;
    }

    this.get();
  }

  addDep(dep) {
    const depId = dep.id;
    if (!this.depIds.has(depId)) {
      this.deps.push(dep);
      this.depIds.add(depId);
      dep.addSub(this);
    }
  }

  get() {
    pushTarget(this);
    this.getter && this.getter();
    popTarget();
    console.log('update');
  }

  update() {
    // this.get();
    queueWatcher(this);
  }

  run() {
    this.get();
  }
}

let queue = [];
let has = {};
let pedding = false;

function queueWatcher(watcher) {
  const { id } = watcher;
  if (!has[id]) {
    queue.push(watcher);
    has[id] = true;
    if (!pedding) {
      // 让更新方法在变成异步更新, 这样就能在同步代码执行完也就是所有 queue 都加入要更新的 watcher 之后再执行
      // 宏任务在所有同步任务和微任务执行完毕之后执行
      setTimeout(() => {
        console.log(queue);
        queue.forEach((watcherItem) => {
          watcherItem.run();
        });
        pedding = false;
        queue = [];
        has = {};
      }, 0);
      pedding = true;
    }
  }

}
