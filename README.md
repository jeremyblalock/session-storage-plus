# shared-session-storage

Multi-tab sessionStorage

## Installing

```
npm install session-storage-plus
```

## Usage

```javascript
var sessionStoragePlus = require('session-storage-plus');

sessionStoragePlus.setItem('key');

sessionStoragePlus.getItem('key', function(value) {
  if (value == null) {
    console.log('Oh no, it’s not defined!');
  } else {
    console.log('Successfully retrieved:', value);
  }
});

sessionStoragePlus.removeItem('key');
```

----

### getItem(key, [timeout=20], callback)

Retrieve a the value of a key, from the current window or any others available. Call `callback` with this value. Calls callback with `undefined` if unavailable.

#### Arguments

##### key (String, required)

The key to retrieve.

##### timeout (Number, optional)

When the timeout is reached, `undefined` will be returned. If not specified, the timeout will be 20ms. From testing, the message response time never exceeded 4ms.

##### callback (Function, required)

Function to be called when a result is available. Should take a single argument `value`.

### setItem(key, value)

Set the value of `key` across all open windows. Current window is syncronous, while others will be asyncronous.

#### Arguments

##### key (String, required)

The key to set.

##### value (String, optional*)

The value to set.

Note: *If blank, `null` or `undefined`, the functionality will be equivalent to `removeItem`

### removeItem(key)

Remove the value of `key` across all open windows. Current window is asyncronous, while others will be asyncronous.

#### Arguments

##### key (String, required)

The key to remove.


## Dependencies

None!

This is a simple package and it should always remain that way.