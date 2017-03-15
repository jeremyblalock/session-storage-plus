# shared-session-storage

Multi-tab sessionStorage

## Usage

```javascript
var sharedSessionStorage = require('shared-session-storage');

// Setting keys happens syncronously in this window, and
// asyncronously updates other windows.
sharedSessionStorage.setItem('key');

// Retrieving is always asynchronous, and will use the local
// value if available, or request the value from other windows otherwise.
sharedSessionStorage.getItem('key', [timeout=100], function(value) {
  if (value == null) {
    // The value will be null if the value is not set in sessionStorage,
    // and no other tabs responded with the value.
    console.log('Oh no, it’s not defined!');
  } else {
    // If found in sessionStorage or retrieved by another tab, then the
    // non-null value will be returned.
    console.log('Successfully retrieved:', value);
  }
});

// Removing keys, like setting happens syncronously in this window,
// and asyncronously in other windows.
sharedSessionStorage.removeItem('key');
```


## Dependencies

None!

This is a simple package and it should always remain that way.