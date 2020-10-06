const oldArrayProtoMethods = Array.prototype;

export const arrayMethods = Object.create(oldArrayProtoMethods);

const methods = [
  'push',
  'pop',
  'shift',
  'unshift',
  'reverse',
  'sort',
  'splice',
];

methods.forEach(method => {
  arrayMethods[method] = function(...args) {
    const result = oldArrayProtoMethods[method].apply(this, args)
    let inserted;
    const ob = this.__ob__;
    switch (method) {
      case 'push':
      case 'unshift':
        inserted = args;
        break;

      case 'splice':
        inserted = args.slice(2);
        break;

      default:

        break;
    }

    if (inserted) {
      ob.observeArray(inserted);
    }

    return result;
  };
});

