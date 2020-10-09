export function proxy(vm, dataKey, key) {
  Object.defineProperty(vm, key, {
    get() {
      return vm[dataKey][key];
    },
    set(newValue) {
      vm[dataKey][key] = newValue;
    }
  });
}

export function defineProperty(target, key, value) {
  Object.defineProperty(target, key, {
    enumerable: false,
    configurable: false,
    value,
  });
}

// 不同选项属性的合并策略
const strats = {
  data(parentValue, childValue) {
    return childValue;
  },
  computed() {},
  watch() {},
}

const LIFECYCLE_HOOKS = [
  'beforeCreate',
  'created',
  'beforeMount',
  'mounted',
  'beforeUpdate',
  'updated',
  'beforeDestroy',
  'destroyed',
];

/**
 * 合并生命周期
 * @param{Function} parentValue
 * @param{Function} childValue
 */
function mergeHook(parentValue, childValue) {
  const prev = parentValue || [];
  const current = childValue || [];

  // concat 的参数如果是数组那么会将数组元素展开, 如果不是数组那么会将该参数直接push
  // 所以这里直接使用 current 即可
  return prev.concat(current);
}

LIFECYCLE_HOOKS.forEach((hook) => {
  strats[hook] = mergeHook;
});


/**
 * 合并选项
 * @param{Object} parent 之前的选项
 * @param{Object} child 新加入需要被合并的选项
 */
export function mergeOptions(parent, child) {
  // 使用策略合并, 每个option的属性合并方式不一样

  const options = {};

  for (let pKey in parent) {
    mergeField(pKey);
  }

  for (let cKey in child) {
    if (!parent.hasOwnProperty(cKey)) {
      mergeField(cKey);
    }
  }

  // 合并之前选项和当前传递进来选项的属性
  function mergeField(key) {
    if (strats[key]) {
      options[key] = strats[key](parent[key], child[key]); // 目前只有一个 lifecycle hook 的合并策略
    } else {
      options[key] = child[key];
    }
  }

  return options;
}

let callbacks = []; // nextTick 中需要执行的操作, 前面的应该是 watcher 里的 update
let pedding = false;
const flushCallbacks = () => {
  // 这里不应该用 pop
  callbacks.forEach((cb) => {
    cb();
  });

  pedding = false;
  callbacks = [];
}

let timerFunc;
if (Promise) {
  timerFunc = () => {
    Promise.resolve().then(() => {
      flushCallbacks();
    })
  }
} else if (MutationObserver) {
  const obaserve = new MutationObserver(flushCallbacks);
  const textNode = document.createTextNode(1);
  obaserve.observe(textNode, { characterData: true });
  timerFunc = () => {
    textNode.textContent = 2;
  }
} else if (setImmediate) {
  timerFunc = () => {
    setImmediate(flushCallbacks);
  }
} else {
  timerFunc = () => {
    setTimeout(() => {
      flushCallbacks();
    }, 0);
  }
}

export function nextTick(cb) {
  callbacks.push(cb);
  if (!pedding) {
    pedding = true;
    timerFunc();
  }
}
