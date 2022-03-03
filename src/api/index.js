const context = require.context('./', false, /^\.\/[^_'index'][\w-]+$/);
const apis=context.keys().reduce((exp,key) => {
  let model=context(key);
  if (model && model.default) {
    model = model.default;
  }
  const match = key.match(/^\.\/([^_][\w-]+)$/);
  exp[match[1]]={...model};
  return exp;
},{});

export default apis;
