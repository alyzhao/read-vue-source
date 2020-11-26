import { mergeOptions } from '../util';
import initExtend from './extend';

export function initGlobalApi (Vue) {
  Vue.options = {}; //  Vue 的全局属性, 比如 components directive 指令

  /**
   * mixin 做的实际上就是合并 options 只做这一件事
   */
  Vue.mixin = function (mixin) {
    // ? this 在这儿指的是什么?
    this.options = mergeOptions(this.options, mixin);
  };

  initExtend(Vue);

  Vue.options._base = Vue; // 将 Vue 构造函数赋值给 options._base, 目的是在子组件也能拿到父类的构造函数
  Vue.options.components = {};

  Vue.component = function (id, definition) {
    definition.name = definition.name || id; // 组件都需要一个 name 默认取 id

    definition = this.options._base.extend(definition);

    Vue.options.components[id] = definition;
  };
}
