import { initMixin } from './init';
import { lifecycleMixin } from './lifecycle';
import { renderMixin } from './vdom/index';

function Vue(options) {
  this._init(options);
}

initMixin(Vue);
lifecycleMixin(Vue); // 混合生命周期 render
renderMixin(Vue);

export default Vue;
