'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (babel) {
  var types = babel.types,
      mapKeys = [],
      mapFuncs = void 0,
      dropDebugger = void 0;
  return {
    visitor: {
      Program: function Program(path, PluginPass) {
        var define = PluginPass.opts.define;

        dropDebugger = !!PluginPass.opts.dropDebugger;
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
      DebuggerStatement: function DebuggerStatement(path) {
        if (dropDebugger) {
          path.remove();
        }
      },

      Conditional: {
        exit: function exit(path) {
          var res = _evaluate.evaluate.call(path.get('test'));

          if (res.confident) {
            var replacement = path.get(res.value ? 'consequent' : 'alternate');
            var node = replacement.node;
            var scope = replacement.scope;

            if (scope.path !== replacement) {
              //not a block
              node ? path.replaceWith(node) : path.remove();
            } else if (Object.getOwnPropertyNames(scope.bindings).length != 0) {
              node ? path.replaceWith(node) : path.remove();
            } else {
              //no declaration in scope
              path.replaceWithMultiple(node.body);
            }
          }
        }
      },
      LogicalExpression: {
        exit: function exit(path) {
          var operator = path.node.operator;var left = path.get('left');var right = path.get('right');
          var leftVal = _evaluate.evaluate.call(left);
          if (operator == '||' && leftVal.confident) {
            path.replaceWith(leftVal.value ? left : right);
          } else if (operator == '&&' && leftVal.confident) {
            path.replaceWith(leftVal.value ? right : left);
          }
        }
      }
    }
  };
};

var _evaluate = require('./evaluate');

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
      throw Error('not support:' + type + ' as conditional variable');
  }
}