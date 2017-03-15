# shared-session-storage

Multi-tab sessionStorage

## Usage

```javascript
var sharedSessionStorage = require('shared-session-storage');

// Setting keys happens syncronously in this window,
// and asynchronously updates other windows.
sharedSessionStorage.setItem('key');

// Retrieving is always asynchronous, and will use the local
// value if available, or request the value from other tabs otherwise.
sharedSessionStorage.getItem('key', [timeout=100ms], function(value) {
  if (value == null) {
    // The value will be null if the value is not set in sessionStorage,
    // and no other tabs responded with the value.
    console.log('Oh no, it's not defined!');
  } else {
    // If found in localStorage or retrieved by another tab, then the
    // non-null value will be returned.
    console.log('Successfully retrieved:', value);
  }
});
```