/**
 * Created by brian on 12/30/15.
 */
"use strict";
var babel = require('babel-core');
var plugin = require('../dist').default;
function compileToEqual(ori, result, cfg, msg) {
  let { define, dropDebugger }=cfg || {};
  let transformedCode = babel.transform(ori + '', {
    compact: true,
    plugins: [
      [plugin, { define: define || {}, dropDebugger }]
    ]
  }).code, oriCode = babel.transform(result + '', { compact: true }).code;
  console.assert(transformedCode == oriCode, msg || 'expect code error');
  if (msg) {
    console.log('success:' + msg);
  }
}
compileToEqual(function addEventListener(obj, evtName, handler, once) {
  if (typeof evtName == "string" && evtName) {
    if (!obj.hasOwnProperty('$$callbacks')) {
      obj.$$callbacks = {};
    }
  }
  return false;
}, function addEventListener(obj, evtName, handler, once) {
  if (typeof evtName == "string" && evtName) {
    if (!obj.hasOwnProperty('$$callbacks')) {
      obj.$$callbacks = {};
    }
  }
  return false;
}, {}, 'param complex');
compileToEqual(function param(a) {
  if (a) {
    console.log('a')
  }
}, function param(a) {
  if (a) {
    console.log('a')
  }
}, {}, 'param');
compileToEqual(function param(a) {
  if (a) {
    console.log('a')
  }
}, function param(a) {
  if (a) {
    console.log('a')
  }
}, { a: false }, 'no effect param');
compileToEqual(function a() {
  debugger;
}, function a() {
}, { dropDebugger: true }, 'drop debugger;');
compileToEqual(function a() {
  if (IS_DEV) {
    console.log('dev');
  }
}, function a() {
}, { define: { IS_DEV: 0 } }, 'simple remove');
compileToEqual(function a() {
  if (IS_DEV) {
    console.log('dev');
  }
}, function a() {
  console.log('dev')
}, { define: { IS_DEV: 1 } }, 'simple no block');
compileToEqual(
  function a() {
    if (isNaN(x) && IS_DEV) {
      throw Error('x is nan');
    }
  },
  function a() {

  }, { define: { IS_DEV: false } }, 'binary && ->false');
compileToEqual(
  function a() {
    if (IS_DEV && isNaN(x)) {
      throw Error('x is nan');
    }
  },
  function a() {
    if (isNaN(x)) {
      throw Error('x is nan');
    }
  }, { define: { IS_DEV: true } }, 'binary && -> right');
compileToEqual(
  function a() {
    if (IS_DEV || isNaN(x)) {
      throw Error('x is nan');
    }
  },
  function a() {
    throw Error('x is nan');
  }, { define: { IS_DEV: true } }, 'binary || ->true');
compileToEqual(
  function a() {
    if (IS_DEV || isNaN(x)) {
      throw Error('x is nan');
    }
  },
  function a() {
    if (isNaN(x)) {
      throw Error('x is nan');
    }
  }, { define: { IS_DEV: 0 } }, 'binary || ->right');
compileToEqual(
  function a() {
    if (IS_DEV || IS_P2 && IS_TH) {
      throw Error('x is nan');
    }
  },
  function a() {
    throw Error('x is nan');
  }, { define: { IS_DEV: 0, IS_P2: 1, IS_TH: 1 } }, 'binary complex');
compileToEqual(function a() {
  if (IS_DEV) {
    let a = 3;
    console.log(a);
  }
}, function a() {
}, { define: { IS_DEV: 0 } }, 'remove block');
compileToEqual(function a() {
  if (IS_DEV) {
    console.log('dev');
  }
}, function a() {
  console.log('dev')
}, { define: { IS_DEV: 1 } }, 'simple with block');
compileToEqual(function if_else() {
  if (IS_DEV) {
    a()
  } else {
    b()
  }
}, function if_else() {
  b()
}, { define: { IS_DEV: false } }, 'if_else');
compileToEqual(function t() {
  if (IS_DEV) {
    a()
  } else if (IS_PUB) {
    b()
  }
  else {

  }
}, function t() {
  if (IS_DEV) {
    a();
  } else {
    b()
  }
}, { define: { IS_PUB: true } }, 'if_elseif');
compileToEqual(function t() {
  if (IS_DEV) {
    a()
  } else if (IS_PUB) {
    b()
  }
  else {
    c()
  }
}, function t() {
  c()
}, { define: { IS_PUB: false, IS_DEV: false } }, 'if_else_else');
compileToEqual(function t() {
  if (IS_DEV) {
    var a = 'dev';
  }
  else {
    a = 'pub';
  }
  log(a);
}, function t() {
  var a = 'dev';
  log(a);
}, { define: { IS_DEV: 1 } }, 'lift scope');
compileToEqual(`function t(){
  if(IS_DEV){
    let a=2;
  }else{
    let a=3;
  }
}`, `function t(){
  {
    let a=3;
  }
}`, { define: { IS_DEV: false } }, 'keep scope');
