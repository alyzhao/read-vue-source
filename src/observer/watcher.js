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
  }

  update() {
    this.get();
  }
}