'use strict';

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);

  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);

    if (enumerableOnly) {
      symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
    }

    keys.push.apply(keys, symbols);
  }

  return keys;
}

function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};

    if (i % 2) {
      ownKeys(Object(source), true).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(Object(source)).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }

  return target;
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

var identity = function identity(x) {
  return x;
};

var getUndefined = function getUndefined() {};

var filter = function filter() {
  return true;
};

var getType = function getType(action) {
  return action.type;
};

var createSentryMiddleware = function createSentryMiddleware(Sentry) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var _options$breadcrumbDa = options.breadcrumbDataFromAction,
      breadcrumbDataFromAction = _options$breadcrumbDa === void 0 ? getUndefined : _options$breadcrumbDa,
      _options$breadcrumbMe = options.breadcrumbMessageFromAction,
      breadcrumbMessageFromAction = _options$breadcrumbMe === void 0 ? getType : _options$breadcrumbMe,
      _options$actionTransf = options.actionTransformer,
      actionTransformer = _options$actionTransf === void 0 ? identity : _options$actionTransf,
      _options$stateTransfo = options.stateTransformer,
      stateTransformer = _options$stateTransfo === void 0 ? identity : _options$stateTransfo,
      _options$breadcrumbCa = options.breadcrumbCategory,
      breadcrumbCategory = _options$breadcrumbCa === void 0 ? "redux-action" : _options$breadcrumbCa,
      _options$filterBreadc = options.filterBreadcrumbActions,
      filterBreadcrumbActions = _options$filterBreadc === void 0 ? filter : _options$filterBreadc,
      getUserContext = options.getUserContext,
      getTags = options.getTags;
  return function (store) {
    var lastAction;
    Sentry.withScope(function (scope) {
      scope.addEventProcessor(function (event, hint) {
        var state = {};

        try {
          state = store.getState();
        } catch (e) {
          event.extra = _objectSpread2(_objectSpread2({}, event.extra), {}, {
            storeIsDispatching: true
          });
        }

        event.extra = _objectSpread2(_objectSpread2({}, event.extra), {}, {
          lastAction: actionTransformer(lastAction),
          state: stateTransformer(state)
        });

        if (getUserContext) {
          event.user = _objectSpread2(_objectSpread2({}, event.user), getUserContext(state));
        }

        if (getTags) {
          var tags = getTags(state);
          Object.keys(tags).forEach(function (key) {
            scope.tags = _objectSpread2(_objectSpread2({}, scope.tags), {}, _defineProperty({}, key, tags[key]));
          });
        }

        return event;
      });
    });
    return function (next) {
      return function (action) {
        if (filterBreadcrumbActions(action)) {
          Sentry.addBreadcrumb({
            category: breadcrumbCategory,
            message: breadcrumbMessageFromAction(action),
            level: "info",
            data: breadcrumbDataFromAction(action)
          });
        }

        lastAction = action;
        return next(action);
      };
    };
  };
};

module.exports = createSentryMiddleware;
