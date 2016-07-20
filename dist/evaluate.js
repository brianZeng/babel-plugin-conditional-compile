"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.evaluateTruthy = evaluateTruthy;
exports.evaluate = evaluate;
/* eslint indent: 0 */
/* eslint max-len: 0 */

// This file contains Babels metainterpreter that can evaluate static code.

/* eslint eqeqeq: 0 */

var VALID_CALLEES = ["String", "Number", "Math"];
var INVALID_METHODS = ["random"];

/**
 * Walk the input `node` and statically evaluate if it's truthy.
 *
 * Returning `true` when we're sure that the expression will evaluate to a
 * truthy value, `false` if we're sure that it will evaluate to a falsy
 * value and `undefined` if we aren't sure. Because of this please do not
 * rely on coercion when using this method and check with === if it's false.
 *
 * For example do:
 *
 *   if (t.evaluateTruthy(node) === false) falsyLogic();
 *
 * **AND NOT**
 *
 *   if (!t.evaluateTruthy(node)) falsyLogic();
 *
 */

function evaluateTruthy() {
  var res = this.evaluate();
  if (res.confident) {
    return !!res.value;
  }
}

/**
 * Walk the input `node` and statically evaluate it.
 *
 * Returns an object in the form `{ confident, value }`. `confident` indicates
 * whether or not we had to drop out of evaluating the expression because of
 * hitting an unknown node that we couldn't confidently find the value of.
 *
 * Example:
 *
 *   t.evaluate(parse("5 + 5")) // { confident: true, value: 10 }
 *   t.evaluate(parse("!true")) // { confident: true, value: false }
 *   t.evaluate(parse("foo + foo")) // { confident: false, value: undefined }
 *
 */

function evaluate() {
  var confident = true;
  var deoptPath = void 0;
  var seen = new Map();

  function deopt(path) {
    if (!confident) {
      return;
    }
    deoptPath = path;
    confident = false;
  }

  var value = evaluate(this);
  if (!confident) {
    value = undefined;
  }
  return {
    confident: confident,
    deopt: deoptPath,
    value: value
  };

  // we wrap the _evaluate method so we can track `seen` nodes, we push an item
  // to the map before we actually evaluate it so we can deopt on self recursive
  // nodes such as:
  //
  //   var g = a ? 1 : 2,
  //       a = g * this.foo
  //
  function evaluate(path) {
    var node = path.node;


    if (seen.has(node)) {
      var existing = seen.get(node);
      if (existing.resolved) {
        return existing.value;
      } else {
        deopt(path);
        return;
      }
    } else {
      var item = { resolved: false };
      //function params shold not be cached
      if (path.listKey == "params" && !path.isIdentifier()) {
        seen.set(node, item);
      }

      var val = _evaluate(path);
      item.resolved = true;
      item.value = value;
      return val;
    }
  }

  function _evaluate(path) {
    if (!confident) {
      return;
    }

    var node = path.node;


    if (path.isSequenceExpression()) {
      var exprs = path.get("expressions");
      return evaluate(exprs[exprs.length - 1]);
    }

    if (path.isStringLiteral() || path.isNumericLiteral() || path.isBooleanLiteral()) {
      return node.value;
    }

    if (path.isNullLiteral()) {
      return null;
    }

    if (path.isTemplateLiteral()) {
      var str = "";

      var i = 0;
      var exprs = path.get("expressions");

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = node.quasis[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var elem = _step.value;

          // not confident, evaluated an expression we don't like
          if (!confident) {
            break;
          }

          // add on cooked element
          str += elem.value.cooked;

          // add on interpolated expression if it's present
          var expr = exprs[i++];
          if (expr) {
            str += String(evaluate(expr));
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      if (!confident) {
        return;
      }
      return str;
    }

    if (path.isConditionalExpression()) {
      var testResult = evaluate(path.get("test"));
      if (!confident) {
        return;
      }
      if (testResult) {
        return evaluate(path.get("consequent"));
      } else {
        return evaluate(path.get("alternate"));
      }
    }

    if (path.isExpressionWrapper()) {
      // TypeCastExpression, ExpressionStatement etc
      return evaluate(path.get("expression"));
    }

    // "foo".length
    if (path.isMemberExpression() && !path.parentPath.isCallExpression({ callee: node })) {
      var property = path.get("property");
      var object = path.get("object");

      if (object.isLiteral() && property.isIdentifier()) {
        var _value = object.node.value;
        var type = typeof _value === "undefined" ? "undefined" : _typeof(_value);
        if (type === "number" || type === "string") {
          return _value[property.node.name];
        }
      }
    }

    if (path.isReferencedIdentifier()) {
      var binding = path.scope.getBinding(node.name);
      if (binding && binding.hasValue) {
        return binding.value;
      } else {
        if (node.name === "undefined") {
          return undefined;
        } else if (node.name === "Infinity") {
          return Infinity;
        } else if (node.name === "NaN") {
          return NaN;
        }

        var resolved = path.resolve();
        if (resolved === path) {
          return deopt(path);
        } else {
          return evaluate(resolved);
        }
      }
    }

    if (path.isUnaryExpression({ prefix: true })) {
      if (node.operator === "void") {
        // we don't need to evaluate the argument to know what this will return
        return undefined;
      }

      var argument = path.get("argument");
      if (node.operator === "typeof" && (argument.isFunction() || argument.isClass())) {
        return "function";
      }

      var arg = evaluate(argument);
      if (!confident) {
        return;
      }
      switch (node.operator) {
        case "!":
          return !arg;
        case "+":
          return +arg;
        case "-":
          return -arg;
        case "~":
          return ~arg;
        case "typeof":
          return typeof arg === "undefined" ? "undefined" : _typeof(arg);
      }
    }

    if (path.isArrayExpression()) {
      var arr = [];
      var elems = path.get("elements");
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = elems[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var elem = _step2.value;

          elem = elem.evaluate();

          if (elem.confident) {
            arr.push(elem.value);
          } else {
            return deopt(elem);
          }
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }

      return arr;
    }

    if (path.isObjectExpression()) {
      // todo
    }

    if (path.isLogicalExpression()) {
      // If we are confident that one side of an && is false, or the left
      // side of an || is true, we can be confident about the entire expression
      var wasConfident = confident;
      var left = evaluate(path.get("left"));
      var leftConfident = confident;
      confident = wasConfident;
      var right = evaluate(path.get("right"));
      var rightConfident = confident;
      confident = leftConfident && rightConfident;

      switch (node.operator) {
        case "||":
          // TODO consider having a "truthy type" that doesn't bail on
          // left uncertainity but can still evaluate to truthy.
          if (left && leftConfident) {
            confident = true;
            return left;
          }

          if (!confident) {
            return;
          }

          return left || right;
        case "&&":

          if (!left && leftConfident || !right && rightConfident) {
            confident = true;
          }

          if (!confident) {
            return;
          }

          return left && right;
      }
    }

    if (path.isBinaryExpression()) {
      var left = evaluate(path.get("left"));
      if (!confident) {
        return;
      }
      var right = evaluate(path.get("right"));
      if (!confident) {
        return;
      }

      switch (node.operator) {
        case "-":
          return left - right;
        case "+":
          return left + right;
        case "/":
          return left / right;
        case "*":
          return left * right;
        case "%":
          return left % right;
        case "**":
          return Math.pow(left, right);
        case "<":
          return left < right;
        case ">":
          return left > right;
        case "<=":
          return left <= right;
        case ">=":
          return left >= right;
        case "==":
          return left == right;
        case "!=":
          return left != right;
        case "===":
          return left === right;
        case "!==":
          return left !== right;
        case "|":
          return left | right;
        case "&":
          return left & right;
        case "^":
          return left ^ right;
        case "<<":
          return left << right;
        case ">>":
          return left >> right;
        case ">>>":
          return left >>> right;
      }
    }

    if (path.isCallExpression()) {
      var callee = path.get("callee");
      var context = void 0;
      var func = void 0;

      // Number(1);
      if (callee.isIdentifier() && !path.scope.getBinding(callee.node.name, true) && VALID_CALLEES.indexOf(callee.node.name) >= 0) {
        func = global[node.callee.name];
      }

      if (callee.isMemberExpression()) {
        var object = callee.get("object");
        var property = callee.get("property");

        // Math.min(1, 2)
        if (object.isIdentifier() && property.isIdentifier() && VALID_CALLEES.indexOf(object.node.name) >= 0 && INVALID_METHODS.indexOf(property.node.name) < 0) {
          context = global[object.node.name];
          func = context[property.node.name];
        }

        // "abc".charCodeAt(4)
        if (object.isLiteral() && property.isIdentifier()) {
          var type = _typeof(object.node.value);
          if (type === "string" || type === "number") {
            context = object.node.value;
            func = context[property.node.name];
          }
        }
      }

      if (func) {
        var args = path.get("arguments").map(evaluate);
        if (!confident) {
          return;
        }

        return func.apply(context, args);
      }
    }

    deopt(path);
  }
}