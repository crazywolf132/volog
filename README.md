# VOLOG: Elevate Your Logs
_**"Empower Your Insights, Let Your Logs Soar with VOLOG"**_

VOLOG - where your application's logs don't just tell a story, they take flight, offering a higher perspective on your code's journey.

<img src="https://raw.githubusercontent.com/crazywolf132/volog/main/.github/app.gif" alt="Made with VOLOG" />

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

### Customizing Logs with Settings

VOLOG allows customization of logging behavior through the `volog.settings` system. Here are the available settings along with their default values:

#### _**showTime**_ (default: `true`): Display timestamp with each log message.

```javascript
log.settings.showTime = true; // Enables timestamp in logs
```

#### _**scope**_: Define a scope or context for your log messages.

```javascript
log.settings.scope = 'AuthenticationModule'; // Sets a specific scope
```

#### _**formatArguments**_ (default: `true``): Toggle formatting for additional arguments.

```javascript
log.settings.formatArguments = true; // Enables formatting for extras
```


#### _**argsFormatter**_: Provide a custom formatter for additional arguments. This function receives three parameters:

- `arg`: The current argument from the log method call.
- `idx`: The index (position) of the argument in the log method call.
- `chalk`: A copy of the Chalk library, allowing you to apply text styles without needing to install Chalk separately.

```javascript
log.settings.argsFormatter = (arg, idx, chalk) => chalk.green(`(${idx}): ${arg}`);
```

#### _**colorEntireRow**_ (default: `false`): Color the entire log row instead of just the log level.

```javascript
log.settings.colorEntireRow = true;
```

#### _**colorRowLevels**_ (default: `['debug', 'info', 'warn', 'error', 'fatal']`): Specify which log levels should have colored rows.

```javascript
log.settings.colorRowLevels = ['error', 'fatal']; // Only 'error' and 'fatal' logs will have colored rows
```

#### _**customColorMap**_: Define custom colors for different log levels.

```javascript
log.settings.customColorMap = {
  debug: 'blue',
  info: '\u001b[33m', // ANSI color code
  warn: (chalk) => chalk.bgYellow.black, // Using chalk function
  error: 91, // ANSI color number
  fatal: 'magenta'
};
```

### Log Output

When a log function is called, VOLOG generates an output in the console which includes:

- A timestamp (if enabled).
- A scope (if defined).
- A colored label indicating the log level (DEBUG, INFO, WARN, ERROR, FATAL).
- The log message.
- Any additional contextual information provided.

### Scoped Settings

Settings in VOLOG are scoped to each import of the library. This means that you can have different settings for different areas of your code. For example, you might have different log settings for authentication and data processing modules.

If you want to maintain consistent settings across multiple files, it is recommended to create a wrapper for VOLOG. This wrapper can set up the desired settings and be imported wherever you need logging.

### Example Usage with Scoped Settings

```javascript
// logWrapper.js
import log from 'volog';

log.settings.showTime = true;
log.settings.scope = 'GlobalScope';
// Other settings...

export default log;

// In other files
import log from './logWrapper';

log.info('Server started', 'port', 3000);
```

Each of these log statements will produce a structured, color-coded output in the console, making it easier to track application behavior and troubleshoot issues effectively.

With VOLOG, logging becomes not just a way of recording what happens in your application, but also a tool for better understanding and debugging your application in real-time.