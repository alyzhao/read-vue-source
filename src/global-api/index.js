import { mergeOptions } from '../util';

export function initGlobalApi (Vue) {
  Vue.options = {}; //  Vue 的全局属性, 比如 components directive 指令

  /**
   * mixin 做的实际上就是合并 options 只做这一件事
   */
  Vue.mixin = function (mixin) {
    // ? this 在这儿指的是什么?
    this.options = mergeOptions(this.options, mixin);
  };
}
