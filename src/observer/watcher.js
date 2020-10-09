import { pushTarget, popTarget } from './dep';
import { nextTick } from '../util';

let id = 0; // 标识每个 watcher 实例

export default class Watcher {
  /**
   * @param{Boolean} options 是否是更新试图
   */
  constructor(vm, exprOrFn, cb, options = {}) {
    this.vm = vm;
    this.exprOrFn = exprOrFn
    this.cb = cb;
    this.options = options;
    this.user = Boolean(options.user);
    this.id = id++;

    this.deps = [];
    this.depIds = new Set();

    if (typeof exprOrFn === 'function') {
      this.getter = exprOrFn;
    } else {
      // 目前只有 options 上的 watch 用到, 这里传过来的是字符串
      // 这时候应该去取值
      this.getter = function () {
        let result = vm;
        const arrProperties = exprOrFn.split('.');
        // 只有每次去取值 调用 get() 的时候才会进行依赖收集
        arrProperties.forEach((p) => {
          result = result[p];
        });
        return result;
      }
    }

    this.value = this.get(); // 将当前 watch 属性的值保存下来
    console.log(this.value);
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
    const value = this.getter && this.getter();
    popTarget();
    return value;
  }

  update() {
    // this.get();
    queueWatcher(this);
  }

  run() {
    const oldValue = this.value;
    const newValue = this.get();
    this.value = newValue;
    if (this.options.user) {
      this.cb.call(this.vm, newValue, oldValue);
    }
  }
}

let queue = [];
let has = {};
let pedding = false;

function flushSchedulerQueue() {
  queue.forEach((watcherItem) => {
    watcherItem.run();
    if (!watcherItem.user) {
      watcherItem.cb();
    }
  });
  pedding = false;
  queue = [];
  has = {};
}

function queueWatcher(watcher) {
  const { id } = watcher;
  if (!has[id]) {
    queue.push(watcher);
    has[id] = true;
    if (!pedding) {
      // 让更新方法在变成异步更新, 这样就能在同步代码执行完也就是所有 queue 都加入要更新的 watcher 之后再执行
      // 宏任务在所有同步任务和微任务执行完毕之后执行
      pedding = true;
      nextTick(flushSchedulerQueue);
    }
  }

}
