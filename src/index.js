import { initMixin } from './init';
import { lifecycleMixin } from './lifecycle';
import { renderMixin } from './vdom/index';
import { initGlobalApi } from './global-api/index';
import { stateMixin } from './state';

import { compileToFunctions } from './compiler/index';
import { patch, createElm } from './vdom/patch';

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

const vm1 = new Vue({
  data() {
    return {
      name: 'tom',
    }
  },
});
const render1 = compileToFunctions(`<div id="a" style="color: red;" class="a">{{name}}</div>`);
const vnode1 = render1.call(vm1);
document.body.appendChild(createElm(vnode1));

const vm2 = new Vue({
  data() {
    return {
      name: 'jerry',
    }
  },
});
const render2 = compileToFunctions(`<div id="b" style="background-color: blue;" class="b">{{name}}</div>`);
const vnode2 = render2.call(vm2);

setTimeout(() => {
  patch(vnode1, vnode2);
}, 1000)


export default Vue;
