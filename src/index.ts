import kleur from "kleur";
import { format } from "date-fns";
import { inspect } from "node:util";

// Define log levels
export enum Level {
  Silent,
  Debug,
  Info,
  Warn,
  Error,
  Fatal,
}

const DEFAULT_LEVEL_COLORS: { [level in Level]?: string } = {
  [Level.Debug]: "cyan",
  [Level.Info]: "blue",
  [Level.Warn]: "yellow",
  [Level.Error]: "red",
  [Level.Fatal]: "magenta",
};

// Options for the logger
interface Options<T extends object = {}> {
  level?: Level;
  prefix?: string;
  reportTimestamp?: boolean;
  reportCaller?: boolean;
  timeFormat?: string | ((date: Date) => string);
  formatter?: Formatter;
  enabledLevels?: Level[];
  disableColors?: boolean;
  fields?: T[];
  disableArgFormatting?: boolean;
  levelColors?: { [level in Level]?: string };
  useFullLevelNames?: boolean;
  dimKeys?: boolean;
}

// Standard logger interface
interface StandardLogOptions {
  forceLevel?: Level; // OPtion to force a specific level
}

// Formatter interface
interface Formatter {
  format(level: Level, msg: unknown, keyvals: unknown[]): string;
}

// Text Formatter
export class TextFormatter implements Formatter {
  private reportTimestamp: boolean;
  private prefix: string;
  private timeFormat: string | ((date: Date) => string);
  private disableColors: boolean;
  private disableArgFormatting: boolean;
  private levelColors: { [level in Level]?: string };
  private useFullLevelNames: boolean;
  private dimKeys: boolean;

  constructor(options?: Options) {
    this.reportTimestamp = options?.reportTimestamp ?? false;
    this.prefix = options?.prefix ?? "";
    this.timeFormat = options?.timeFormat ?? "yyyy/MM/dd HH:mm:ss";
    this.disableColors = options?.disableColors ?? false;
    this.disableArgFormatting = options?.disableArgFormatting ?? false;
    this.levelColors = options?.levelColors ?? {
      [Level.Debug]: "cyan",
      [Level.Info]: "blue",
      [Level.Warn]: "yellow",
      [Level.Error]: "red",
      [Level.Fatal]: "magenta",
    };
    this.useFullLevelNames = options?.useFullLevelNames ?? false;
    this.dimKeys = options?.dimKeys ?? true;
  }

  format(level: Level, msg: unknown, keyvals: unknown[]): string {
    let message = "";
    if (this.reportTimestamp) {
      const timestamp =
        typeof this.timeFormat === "function"
          ? this.timeFormat(new Date())
          : format(new Date(), this.timeFormat);
      message += timestamp + " ";
    }

    // Apply level color if specified
    const levelColor = this.levelColors[level];
    const levelName = this.useFullLevelNames
      ? Level[level].toUpperCase().padEnd(5)
      : Level[level].toUpperCase().slice(0, 4);
    const formattedLevel =
      levelColor && !this.disableColors
        ? kleur[levelColor](levelName)
        : levelName;

    message += formattedLevel + " ";

    if (this.prefix) {
      message += this.disableColors
        ? this.prefix + ": "
        : kleur.gray(this.prefix + ": ");
    }

    message += msg;

    if (keyvals.length > 0) {
      message += " ";
      message += this.formatKeyvals(keyvals);
    }

    return message;
  }

  // Helper function to format key-value pairs with line breaks for arrays
  private formatKeyvals(keyvals: unknown[]): string {
    let message = "";
    if (this.disableArgFormatting) {
      // We are just going to return a string with every arg in it.
      return keyvals
        .map((part: unknown) => inspect(part, { depth: null }))
        .join(" ");
    }

    keyvals = flatten(keyvals);

    for (let i = 0; i < keyvals.length; i += 2) {
      let key = keyvals[i];
      let value = keyvals[i + 1];

      if (typeof value === "string") {
        if (value.includes("\n")) {
          const parts: string[] = [];
          for (const line of value.split("\n")) {
            parts.push(kleur.dim("|") + " " + kleur.white(line));
          }
          key = `\n ${key}`;
          value = `\n ${parts.join("\n ")}`;
        }
      }

      // We are here... so we can assume they want the formatting.
      if (this.dimKeys) {
        key = kleur.dim(key as string);
      }

      message += `${key}=${value} `;
    }
    return message;
  }
}

// JSON Formatter
export class JSONFormatter implements Formatter {
  format(level: Level, msg: unknown, keyvals: unknown[]): string {
    const data: Record<string, unknown> = {
      level: Level[level],
      msg,
    };

    for (let i = 0; i < keyvals.length; i += 2) {
      /* istanbul ignore next */
      data[keyvals[i] as string] = keyvals[i + 1];
    }

    return JSON.stringify(data);
  }
}

// Custom timestamp formatter
// function customTimestampFormatter(date: Date, formatString: string): string {
//   const year = date.getFullYear();
//   const month = String(date.getMonth() + 1).padStart(2, "0");
//   const day = String(date.getDate()).padStart(2, "0");
//   const hours = String(date.getHours()).padStart(2, "0");
//   const minutes = String(date.getMinutes()).padStart(2, "0");
//   const seconds = String(date.getSeconds()).padStart(2, "0");

//   return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
// }

// Caller formatter type
type CallerFormatter = (file: string, line: number, fn: string) => string;

function flatten(...args: unknown[]): unknown[] {
  const result: unknown[] = [];

  function flatten_internal(input: unknown) {
    if (Array.isArray(input)) {
      // if its na array... flatten each element.
      input.forEach(flatten_internal);
    } else if (typeof input === "object" && input !== null) {
      // If it's an object, flatten its values
      Object.entries(input)
        .reduce(
          (acc: unknown[], [key, val]: unknown[]) => [...acc, key, val],
          [],
        )
        .forEach(flatten_internal);
    } else {
      // Otherwise, directly push the value
      result.push(input);
    }
  }

  args.forEach(flatten_internal);
  return result;
}

// The logger class
class Logger {
  private level: Level;
  private prefix: string;
  private reportTimestamp: boolean;
  private reportCaller: boolean;
  private timeFormat: string | ((date: Date) => string);
  private formatter: Formatter;
  private enabledLevels: Set<Level>;
  private disableColors: boolean;
  private fields: object[];
  private disableArgFormatting: boolean;
  private levelColors: { [level in Level]?: string };
  private useFullLevelNames: boolean;

  constructor(options?: Options) {
    this.level = options?.level ?? Level.Info;
    this.prefix = options?.prefix ?? "";
    this.reportTimestamp = options?.reportTimestamp ?? false;
    this.reportCaller = options?.reportCaller ?? false;
    this.timeFormat = options?.timeFormat ?? "yyyy/MM/dd HH:mm:ss";
    this.formatter = options?.formatter ?? new TextFormatter(options);
    this.enabledLevels = new Set(
      options?.enabledLevels ?? [
        Level.Debug,
        Level.Info,
        Level.Warn,
        Level.Error,
        Level.Fatal,
      ],
    );
    this.disableColors = options?.disableColors ?? false;
    this.fields = options?.fields ?? [];
    this.disableArgFormatting = options?.disableArgFormatting ?? false;
    this.levelColors = options?.levelColors ?? DEFAULT_LEVEL_COLORS;
    this.useFullLevelNames = options?.useFullLevelNames ?? false;
  }

  // Implement logging functions for each level
  debug(msg: unknown, ...keyvals: unknown[]) {
    this.log(Level.Debug, msg, keyvals);
  }

  info(msg: unknown, ...keyvals: unknown[]) {
    this.log(Level.Info, msg, keyvals);
  }

  warn(msg: unknown, ...keyvals: unknown[]) {
    this.log(Level.Warn, msg, keyvals);
  }

  error(msg: unknown, ...keyvals: unknown[]) {
    this.log(Level.Error, msg, keyvals);
  }

  fatal(msg: unknown, ...keyvals: unknown[]) {
    this.log(Level.Fatal, msg, keyvals);
    if (!this.shouldLog(Level.Fatal) || this.level === Level.Silent) {
      return;
    }
    /* istanbul ignore next */
    process.exit(1);
  }

  print(msg: unknown, ...keyvals: unknown[]) {
    this.log(Level.Info, msg, keyvals, true); // Treat print as info
  }

  private shouldLog(level: Level, bypass: boolean = false): boolean {
    if (bypass) {
      return true;
    }
    // If the log level is set to SILENT, nothing should log
    if (this.level === Level.Silent) {
      return false;
    }

    // If enabledLogLevels doesn't include the current level, don't log
    if (!this.enabledLevels.has(level)) {
      return false;
    }

    // If the current level is higher than the logLevel, don't log
    if (level < this.level) {
      return false;
    }

    return true;
  }

  private log(
    level: Level,
    msg: unknown,
    keyvals: unknown[],
    bypass: boolean = false,
  ) {
    if (!this.shouldLog(level, bypass)) {
      return;
    }

    // Build the log message
    const message = this.formatter
      .format(level, msg, [...this.fields, ...keyvals])
      .trim();

    // Output the log message
    console.log(message);
  }

  /* istanbul ignore next */
  standardLog(options?: StandardLogOptions): Logger {
    const stdLogger = console; // Use the default console logger

    // Create a wrapper function that maps log levels and calls to the appropriate console method
    const logWrapper = (level: Level, msg: unknown, ...keyvals: unknown[]) => {
      switch (level) {
        case Level.Debug:
          stdLogger.debug(msg, ...keyvals);
          break;
        case Level.Info:
          stdLogger.info(msg, ...keyvals);
          break;
        case Level.Warn:
          stdLogger.warn(msg, ...keyvals);
          break;
        case Level.Error:
          stdLogger.error(msg, ...keyvals);
          break;
        case Level.Fatal:
          stdLogger.error(msg, ...keyvals);
          process.exit(1);
          break;
        default: // Treat print as info
          stdLogger.info(msg, ...keyvals);
      }
    };

    // Create a new logger instance with specified options and the wrapper function
    return new Logger({
      ...this,
      log: logWrapper,
    });
  }

  setLevel(level: Level) {
    this.level = level;
  }

  with(...keyvals: unknown[]): Logger {
    return new Logger({
      ...this,
      fields: [...(this.fields ?? []), ...keyvals],
    });
  }
}

const log = new Logger();
export default log;
export { Logger };
