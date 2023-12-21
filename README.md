# VOLOG: Elevate Your Logs
_**"Empower Your Insights, Let Your Logs Soar with VOLOG"**_

VOLOG - where your application's logs don't just tell a story, they take flight, offering a higher perspective on your code's journey.

### Installation

To start using VOLOG, install it in your project:

```bash
npm install volog
```

### Importing and Using VOLOG

Import VOLOG into your JavaScript file:

```javascript
import log from 'volog';
```

### Basic Logging

VOLOG provides a straightforward way to log messages at different levels. The usage is similar for each level:

```javascript
log.debug('Debug message');
log.info('Information message');
log.warn('Warning message');
log.error('Error message');
log.fatal('Fatal message');
```

### Logging with Additional Context

To provide more context in your logs, VOLOG allows appending extra information. You can pass additional arguments after the message, and VOLOG will automatically format and display them:

```javascript
log.info('User login', 'username', 'johndoe', 'attempt', 1);
log.warn('Memory usage high', 'threshold', '80%');
log.error('Database error', 'code', 500, 'retrying', false);
```

In this approach, each additional argument after the first (the message) is treated as part of the extras. VOLOG will group these extras and display them alongside the log message.

### Log Output

When a log function is called, VOLOG generates an output in the console which includes:

- A timestamp.
- A colored label indicating the log level (DEBUG, INFO, WARN, ERROR, FATAL).
- The log message.
- Any additional contextual information provided.

### Example Usage

Here's an example showcasing how VOLOG can be used in a real-world scenario:

```javascript
import log from 'volog';

// Log server start-up information
log.info('Server started', 'port', 3000);

// Warning about high memory usage
log.warn('Memory usage warning', 'currentUsage', '85%', 'maxAllowed', '90%');

// Error in database operation
log.error('Database connection failed', 'errorCode', 500, 'retryAttempt', 2);
```

Each of these log statements will produce a structured, color-coded output in the console, making it easier to track application behavior and troubleshoot issues effectively.

With VOLOG, logging becomes not just a way of recording what happens in your application, but also a tool for better understanding and debugging your application in real-time.