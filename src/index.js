import { initMixin } from './init';
import { lifecycleMixin } from './lifecycle';
import { renderMixin } from './vdom/index';
import { initGlobalApi } from './global-api/index';
import { stateMixin } from './state';

function Vue(options) {
  this._init(options);
}

// 原型对象上的方法
initMixin(Vue);
lifecycleMixin(Vue); // 混合生命周期 render
renderMixin(Vue);
stateMixin(Vue);

// 静态方法
initGlobalApi(Vue);

export default Vue;
