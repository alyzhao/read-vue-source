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

    this.lazy = options.lazy; // 如果是 computed 添加的 watcher 那么 lazy 为 true, 即标识 computed
    this.dirty = options.lazy; // computed 是否需要重新计算值, 默认为 true, 需要重新计算

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

    this.value = this.lazy ? undefined : this.get(); // 将当前 watch 属性的值保存下来, 如果是计算属性的话第一次不需要保存
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
    const value = this.getter && this.getter.call(this.vm);
    popTarget();
    return value;
  }

  update() {
    if (this.lazy) {
      // 如果是 computed 那么直接更新 dirty 为 true, 下次取值时, 重新获取值
      this.dirty = true;
    } else {
      // 异步更新dom
      queueWatcher(this);
    }
  }

  run() {
    const oldValue = this.value;
    const newValue = this.get();
    this.value = newValue;
    if (this.options.user) {
      this.cb.call(this.vm, newValue, oldValue);
    }
  }

  /**
   * computed 计算属性
   */
  evaluate() {
    this.value = this.get();
    this.dirty = false;
  }

  /**
   * 如果 Dep 当中的 target 还有值, 那么需要将当前的 watcher 所对应的 dep 中收集当前的 target
   */
  depend() {
    let i = this.deps.length;
    while(i--) {
      this.deps[i].depend();
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
