var DEFAULT_TIMEOUT = 20;
var BROADCAST_CHANNEL_AVAILABLE = window && window.BroadcastChannel != null
var BROADCAST_REQUEST_TYPE = 'request'
var BROADCAST_RESULT_TYPE = 'result'
var CHANNEL_NAME = 'shared-session-storage-broadcast';
var STORAGE_PREFIX = 'shared-session-';

var subscriptions = {},
    globalCount = 0;

var channel, broadcast, getItem, setItem, removeItem,
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
    console.log("SETTING:", key, "=>", value);
    window.sessionStorage.setItem(storageKey(key), value);
  } else {
    window.sessionStorage.removeItem(storageKey(key));
  }
}

onRequest = function(key) {
  let value = window.sessionStorage.getItem(storageKey(key));

  if (value != null) {
    broadcastResult(key, value);
  }
}

broadcastResult = function(key, value) {
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
      console.log("REQUEST TYPE");
      return onRequest(data.key);

    case BROADCAST_RESULT_TYPE:
      console.log("RESULT TYPE");
      return onResult(data.key, data.value);

    default:
      console.log('UNEXPECTED TYPE:', data.type);
      break;
  }
}

getItem = function(key, timeout, callback) {
  if (callback == null) {
    callback = timeout;
    timeout = DEFAULT_TIMEOUT;
  }

  var localValue = window.sessionStorage.getItem(storageKey(key));

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
  window.sessionStorage.setItem(storageKey(key), value);

  broadcastResult(key, value);
};

removeItem = function(key) {
  window.sessionStorage.removeItem(storageKey(key));

  broadcastResult(key, null);
}


// Only setup broadcast events if BroadcastChannel is available.
if (BROADCAST_CHANNEL_AVAILABLE) {
  channel = new BroadcastChannel(CHANNEL_NAME);

  broadcast = function(message) {
    channel.postMessage(message);
  };

  channel.addEventListener('message', onMessage);
}


// Only allow us to run normal operation if sessionStorage is available.
if (window && window.sessionStorage) {

  module.exports = {
    getItem    : getItem,
    setItem    : setItem,
    removeItem : removeItem
  };

} else {

  var noop = function() {}
  var dummyGetItem = function(key, timeout, callback) {
    if (callback == null) {
      callback = timeout;
    }
  
    if (callback) callback(null);
  }

  module.exports = {
    getItem: dummyGetItem,
    setItem: noop,
    removeItem: noop
  }

}
