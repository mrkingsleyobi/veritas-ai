'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.legacy_configureStore = undefined;
exports.configureStore = configureStore;

var _redux = require('redux');

var _lodash = require('lodash.isplainobject');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var isFunction = function isFunction(arg) {
  return typeof arg === 'function';
};

/**
 * @deprecated
 *
 * The Redux team does not recommend using this package for testing. Instead, check out our {@link https://redux.js.org/recipes/writing-tests testing docs} to learn more about testing Redux code.
 *
 * Testing with a mock store leads to potentially confusing behaviour, such as state not updating when actions are dispatched. Additionally, it's a lot less useful to assert on the actions dispatched rather than the observable state changes.
 *
 * You can test the entire combination of action creators, reducers, and selectors in a single test, for example:
 * ```js
 * it("should add a todo", () => {
 *   const store = makeStore(); // a user defined reusable store factory
 *
 *   store.dispatch(addTodo("Use Redux"));
 *
 *   expect(selectTodos(store.getState())).toEqual([{ text: "Use Redux", completed: false }]);
 * });
 * ```
 *
 * This avoids common pitfalls of testing each of these in isolation, such as mocked state shape becoming out of sync with the actual application.
 *
 * If you want to use `configureStore` without this visual deprecation warning, use the `legacy_configureStore` export instead.
 *
 * `import { legacy_configureStore as configureStore } from 'redux-mock-store';`
 */
function configureStore() {
  var middlewares = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

  return function mockStore() {
    var _getState = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    function mockStoreWithoutMiddleware() {
      var actions = [];
      var listeners = [];

      var self = {
        getState: function getState() {
          return isFunction(_getState) ? _getState(actions) : _getState;
        },
        getActions: function getActions() {
          return actions;
        },
        dispatch: function dispatch(action) {
          if (!(0, _lodash2.default)(action)) {
            throw new Error('Actions must be plain objects. ' + 'Use custom middleware for async actions.');
          }

          if (typeof action.type === 'undefined') {
            throw new Error('Actions may not have an undefined "type" property. ' + 'Have you misspelled a constant? ' + 'Action: ' + JSON.stringify(action));
          }

          actions.push(action);

          for (var i = 0; i < listeners.length; i++) {
            listeners[i]();
          }

          return action;
        },
        clearActions: function clearActions() {
          actions = [];
        },
        subscribe: function subscribe(cb) {
          if (isFunction(cb)) {
            listeners.push(cb);
          }

          return function () {
            var index = listeners.indexOf(cb);

            if (index < 0) {
              return;
            }
            listeners.splice(index, 1);
          };
        },
        replaceReducer: function replaceReducer(nextReducer) {
          if (!isFunction(nextReducer)) {
            throw new Error('Expected the nextReducer to be a function.');
          }
        }
      };

      return self;
    }

    var mockStoreWithMiddleware = _redux.applyMiddleware.apply(undefined, _toConsumableArray(middlewares))(mockStoreWithoutMiddleware);

    return mockStoreWithMiddleware();
  };
}

/**
 * Create Mock Store returns a function that will create a mock store from a state
 * with the supplied set of middleware applied.
 *
 * @param middlewares The list of middleware to be applied.
 */
var legacy_configureStore = exports.legacy_configureStore = configureStore;

exports.default = configureStore;
