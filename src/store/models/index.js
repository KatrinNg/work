import * as sagaEffects  from 'redux-saga/effects';

/**for jest can not run require.context func */
if(typeof require.context === 'undefined'){
  const fs = require('fs');
  const path = require('path');
  require.context = (base = '.', scanSubDirectories = false, regularExpression = /\.js$/) => {
    const files = {};
    function readDirectory(directory) {
      fs.readdirSync(directory).forEach((file) => {
        const fullPath = path.resolve(directory, file);
        if (fs.statSync(fullPath).isDirectory()) {
          if (scanSubDirectories) readDirectory(fullPath);
          return;
        }
        if (!regularExpression.test(fullPath)) return;
        files[fullPath] = true;
      });
    }
    readDirectory(path.resolve(__dirname, base));
    function Module(file) {
      return require(file);
    }
    Module.keys = () => Object.keys(files);
    return Module;
  };
}
/**for jest can not run require.context func */

const context = require.context('./', false, /\.js$/);
const models=context.keys().filter(item => item !== './index.js').map(key => {
  let model=context(key);
  if (model && model.default) {
    model = model.default;
  }
  return model;
});


function handleAction(actionType, reducer = value=>value) {
  return (state, action) => {
    const { type } = action;
    if (actionType === type) {
      return reducer(state, action);
    }
    return state;
  };
}


const getReducer=(model={})=>{
  const {state={},reducers={}}=model;
  return (s=state,action)=>Object.keys(reducers).map(t =>handleAction(t, reducers[t])).reduce((p,r)=>r(p,action),s);
};

function createEffects(model) {
  function put(action) {
    const { type } = action;
    return sagaEffects.put({ ...action, type:`${model.namespace}/${type}` });
  }

  function putResolve(action) {
    const { type } = action;
    return sagaEffects.put.resolve({
      ...action,
      type: `${model.namespace}/${type}`
    });
  }
  put.resolve = putResolve;

  function take(type) {
    if (typeof type === 'string') {
      return sagaEffects.take(`${model.namespace}/${type}`);
    } else if (Array.isArray(type)) {
      return sagaEffects.take(
        type.map(t => {
          if (typeof t === 'string') {
            return `${model.namespace}/${t}`;
          }
          return t;
        })
      );
    } else {
      return sagaEffects.take(type);
    }
  }
  return { ...sagaEffects, put, take };
}


const getSaga=(model={})=>{
  const {effects={}}=model;
  return Object.keys(effects).map(key=>{
    return (function*() {
      yield sagaEffects.takeEvery(key,(action)=>{
        let ef=createEffects(model);
        return effects[key](action,ef);
      });
    })();
  });
};


function prefix(obj, namespace, type) {
  return Object.keys(obj).reduce((memo, key) => {
    const newKey = `${namespace}/${key}`;
    memo[newKey] = obj[key];
    return memo;
  }, {});
}

function prefixNamespace(model) {
  const { namespace, reducers, effects } = model;
  if (reducers) {
    model.reducers = prefix(reducers, namespace, 'reducer');
  }
  if (effects) {
    model.effects = prefix(effects, namespace, 'effect');
  }
  return model;
}


const ext=models.reduce((exp,model)=>{
  model=prefixNamespace(model);
  exp.reducers[model.namespace]=getReducer(model);
  exp.effects=[...exp.effects,...getSaga(model)];
  return exp;
},{reducers:{},effects:[]});

export const reducers=ext.reducers;
export const effects=ext.effects;

