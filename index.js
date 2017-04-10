var DEFAULT_TIMEOUT = 20;
var BROADCAST_CHANNEL_AVAILABLE = window && window.BroadcastChannel != null
var BROADCAST_REQUEST_TYPE = 'request'
var BROADCAST_RESULT_TYPE = 'result'
var CHANNEL_NAME = 'session-storage-plus-broadcast';
var STORAGE_PREFIX = 'shared-session-';

var subscriptions = {},
    globalCount = 0;

var storage, channel, broadcast, getItem, setItem, removeItem,
    onMessage, onRequest, onResult, broadcastResult, storageKey;

storageKey = function(key) {
  return STORAGE_PREFIX + key;
}

onResult = function(key, value) {
  var hashKey, key, subscription;
  for (var hashKey in subscriptions) {
    subscription = subscriptions[hashKey];

    if (subscription.key == key) {
      delete subscriptions[hashKey];
      subscription.callback(value);
    }
  }

  if (value != null) {
    storage('setItem', storageKey(key), value);
  } else {
    storage('removeItem', storageKey(key));
  }
}

onRequest = function(key) {
  var value = storage('getItem', storageKey(key));

  if (value != null) {
    broadcastResult(key, value);
  }
}

broadcastResult = function(key, value) {
  if (!BROADCAST_CHANNEL_AVAILABLE) return;

  channel.postMessage({
    type: BROADCAST_RESULT_TYPE,
    key: key,
    value: value
  });
};

onMessage = function(message) {
  var data = message.data;
  switch (data.type) {
    case BROADCAST_REQUEST_TYPE:
      return onRequest(data.key);

    case BROADCAST_RESULT_TYPE:
      return onResult(data.key, data.value);

    default:
      break;
  }
}

getItem = function(key, timeout, callback) {
  if (callback == null) {
    callback = timeout;
    timeout = DEFAULT_TIMEOUT;
  }

  var localValue = storage('getItem', storageKey(key));

  if (localValue != null || !BROADCAST_CHANNEL_AVAILABLE) {
    callback(localValue);
    return;
  }

  var hashKey = key + "-" + globalCount++;
  subscriptions[hashKey] = {
    key: key,
    callback: callback
  };
  broadcast({ type: BROADCAST_REQUEST_TYPE, key: key });

  setTimeout(function() {
    if (hashKey in subscriptions) {
      delete subscriptions[hashKey];
      callback();
    }
  }, timeout);
};

setItem = function(key, value) {
  storage('setItem', storageKey(key), value);

  broadcastResult(key, value);
};

removeItem = function(key) {
  storage('removeItem', storageKey(key));

  broadcastResult(key, null);
}

// Abstract the calls to window.sessionStorage to prevent uncaught errors.
storage = function(key) {
  var args = [];
  for (var i = 1; i < arguments.length; i += 1) {
    args.push(arguments[i])
  }
  if (window && window.sessionStorage) {
    return window.sessionStorage[key].apply(window.sessionStorage, args)
  }
}


// Only setup broadcast events if BroadcastChannel is available.
if (BROADCAST_CHANNEL_AVAILABLE) {
  channel = new BroadcastChannel(CHANNEL_NAME);

  broadcast = function(message) {
    channel.postMessage(message);
  };

  channel.addEventListener('message', onMessage);
}


module.exports = {
  getItem    : getItem,
  setItem    : setItem,
  removeItem : removeItem
};

