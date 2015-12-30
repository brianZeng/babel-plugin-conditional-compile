(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (babel) {
  var types = babel.types,
      mapKeys = [],
      mapFuncs = undefined;
  return {
    visitor: {
      Program: function Program(path, PluginPass) {
        var define = PluginPass.opts.define;

        if (define) {
          mapKeys = Object.getOwnPropertyNames(define);
          mapFuncs = mapKeys.map(function (key) {
            return mapAst(define[key], types);
          });
        }
      },
      Identifier: function Identifier(path) {
        var i = mapKeys.indexOf(path.node.name);
        if (i !== -1) {
          path.replaceWith(mapFuncs[i]());
        }
      },

      Conditional: {
        exit: function exit(path) {
          var res = path.get('test').evaluate();
          if (res.confident) {
            var replacement = path.get(res.value ? 'consequent' : 'alternate');
            var node = replacement.node;
            var scope = replacement.scope;

            if (Object.getOwnPropertyNames(scope.bindings).length != 0) {
              path.replaceWith(node || types.emptyStatement());
            } else {
              //no declaration in scope
              path.replaceWithMultiple(node.body);
            }
          }
        }
      }
    }
  };
};

function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

;

function mapAst(val, types) {
  var type = typeof val === 'undefined' ? 'undefined' : _typeof(val);
  switch (type) {
    case "string":
      return function () {
        return types.StringLiteral(val + '');
      };
    case "number":
      return function () {
        return types.NumericLiteral(+val);
      };
    case "null":
      return function () {
        return types.NullLiteral();
      };
    case "undefined":
      return function () {
        return types.Identifier('undefined');
      };
    case "boolean":
      return function () {
        return types.BooleanLiteral(!!val);
      };
    default:
      throw Error('not support:' + type);
  }
}

},{}]},{},[1]);
