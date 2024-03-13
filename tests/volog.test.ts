import kleur from "kleur";
import { Logger, Level, JSONFormatter } from "../src/";
import { format } from "date-fns";

function stripAnsi(str: string): string {
  return str.replace(
    /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
    "",
  );
}

const originalConsoleLog = console.log;

describe("Logger", () => {
  let logger: Logger;
  let output: string[];
  let rawOutput: string[];

  beforeEach(() => {
    output = [];
    rawOutput = [];
    logger = new Logger();

    console.log = (...args: any[]) => {
      output.push(stripAnsi(args.join(" ")));
      rawOutput.push(args.join(" "));
    };
  });

  describe("log levels", () => {
    it("should log messages at the specified level and below", () => {
      logger.setLevel(Level.Info);

      logger.debug("This is a debug message.");
      logger.info("This is an info message.");
      logger.warn("This is a warning message.");
      logger.error("This is an error message.");

      expect(output).toEqual([
        "INFO This is an info message.",
        "WARN This is a warning message.",
        "ERRO This is an error message.",
      ]);
    });

    it("should not log messages below the specified level", () => {
      logger.setLevel(Level.Warn);

      logger.debug("This is a debug message.");
      logger.info("This is an info message.");

      expect(output).toEqual([]);
    });

    it('should log messages with the "print" level regardless of the set level', () => {
      logger.setLevel(Level.Error);

      logger.print("This is a print message.");

      expect(output).toEqual(["INFO This is a print message."]);
    });

    it("should bypass log requirements when bypass is present", () => {
      logger.setLevel(Level.Info);

      logger["log"](Level.Info, "hello world", [], true);

      expect(output).toEqual(["INFO hello world"]);
    });

    it('should not log messages with the "silent" level', () => {
      logger.setLevel(Level.Silent);

      logger.debug("This is a debug message.");
      logger.info("This is an info message.");
      logger.warn("This is a warning message.");
      logger.error("This is an error message.");
      logger.fatal("This is a fatal message.");

      expect(output).toEqual([]);
    });

    it("should format strings with `\n` in them", () => {
      logger.setLevel(Level.Info);

      logger.info("Todo list", "items", ["one", "two", "three"].join("\n"));

      expect(output).toEqual([
        "INFO Todo list \n items=\n | one\n | two\n | three",
      ]);
    });

    it("should handle objects", () => {
      logger.info("Hello", { location: "world" });

      expect(output).toEqual(["INFO Hello location=world"]);
    });
  });

  describe("options", () => {
    it('should respect the "prefix" option', () => {
      logger = new Logger({ prefix: "MyPrefix" });
      logger.info("This is a message.");

      expect(output).toEqual(["INFO MyPrefix: This is a message."]);
    });

    it('should respect the "reportTimestamp" option', () => {
      logger = new Logger({ reportTimestamp: true });
      logger.info("This is a message.");

      expect(output[0]).toContain(format(new Date(), "yyyy/MM/dd HH:mm:ss"));
    });

    it('should respect the "timeFormat" option', () => {
      logger = new Logger({ timeFormat: "HH:mm:ss", reportTimestamp: true });
      logger.info("This is a message.");

      expect(output[0]).toContain(format(new Date(), "HH:mm:ss"));
    });

    it('should respect the "formatter" option', () => {
      logger = new Logger({ formatter: new JSONFormatter() });
      logger.info("This is a message.");

      expect(output[0]).toBe(
        JSON.stringify({ level: "Info", msg: "This is a message." }),
      );
    });

    it('should respect the "enabledLevels" option', () => {
      logger = new Logger({
        level: Level.Debug,
        enabledLevels: [Level.Debug, Level.Error],
      });

      logger.debug("This is a debug message.");
      logger.info("This is an info message.");
      logger.error("This is an error message.");

      expect(output).toEqual([
        "DEBU This is a debug message.",
        "ERRO This is an error message.",
      ]);
    });

    it('should respect the "disableColors" option', () => {
      logger = new Logger({ disableColors: true });
      logger.info("This is a message.");

      expect(output[0]).not.toContain("\u001b"); // Check for absence of color codes
    });

    it('should respect the "fields" option', () => {
      logger = new Logger({ fields: ["foo", "bar"] });
      logger.info("This is a message.");

      expect(output[0]).toContain("foo=bar");
    });

    it('should respect the "disableArgFormatting" option', () => {
      logger = new Logger({ disableArgFormatting: true });
      logger.info("This is a message.", { foo: "bar" });

      expect(output[0]).toContain("{ foo: 'bar' }"); // No detailed formatting
    });

    it('should respect the "levelColors" option', () => {
      logger = new Logger({
        level: Level.Debug,
        levelColors: { [Level.Debug]: "green" },
      });
      logger.debug("This is a debug message.");

      expect(rawOutput[0]).toContain(kleur.green("DEBU")); // Check for green color code
    });
  });

  describe("sub-loggers", () => {
    it("should create sub-loggers with additional fields", () => {
      const subLogger = logger.with("foo", "bar");
      subLogger.info("This is a message.");

      expect(output).toEqual(["INFO This is a message. foo=bar"]);
    });
  });

  describe("standardLog adapter", () => {
    it("should create a standard logger that can be used with other libraries", () => {
      const stdLogger = logger.standardLog();
      stdLogger.error("This is an error message.");

      expect(output).toEqual(["ERRO This is an error message."]);
    });
  });
});
