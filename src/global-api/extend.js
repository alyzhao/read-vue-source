import { mergeOptions } from '../util';

export default function initExtend (Vue) {
  Vue.extend = function (extendOptions) {
    const Super = this; // this 指的是 Vue 构造函数
    const Sub = function VueComponent(options) {
      this._init();
    }

    Sub.prototype = Object.create(Super.prototype);
    Sub.constructor = Sub;
    Sub.options = mergeOptions(Super.options, extendOptions);

    Sub.components = Super.components;

    return Sub;
  }
}