import type { Chalk } from 'chalk';
import chalk from 'chalk';
import type { InternalLog, Settings } from '../src/types'; // Adjust this import based on your project structure
import { actualLog, cleanValue, color, formatParts, formatTime, formatType, groupParts } from '../src/utils';

function stripAnsi(str: string): string {
    const ansiRegex = /[\u001B\u009B][[\]()#;?]*(?:(?:[a-zA-Z\d]*(?:;[-a-zA-Z\d\/#&.:=?%@~_]*)*)?\u0007|(?:(?:\d{1,4}(?:;\d{0,4})*)?[mGK]))/g;
    return str.replace(ansiRegex, '');
}

describe('utils', () => {

    describe('actualLog function', () => {
        let consoleOutput: string;

        beforeEach(() => {
            consoleOutput = '';
            console.log = jest.fn(output => {
                consoleOutput += output;
            });
        });

        it('should include scope in the log if scope setting is provided', () => {
            const mockTime = new Date("2024-01-01T12:00:00");
            const log: InternalLog = {
                type: 'info',
                time: mockTime,
                message: 'Test message',
                settings: {
                    showTime: true,
                    scope: 'TestScope',
                    formatArguments: false,
                    colorEntireRow: false,
                    colorRowLevels: ['info']
                },
                extras: []
            };

            actualLog(log);

            const expectedOutput = `${formatTime(mockTime)} [TestScope] ${formatType(log.type, log.settings)} ${log.message}`;
            expect(stripAnsi(consoleOutput)).toBe(stripAnsi(expectedOutput));
        });

        it('should correctly format extras when formatArguments is true', () => {
            const mockTime = new Date("2024-01-01T12:00:00");
            const extras = ["key1", "value1", "key2", "value2"];
            const log: InternalLog = {
                type: 'info',
                time: mockTime,
                message: 'Test message with extras',
                settings: {
                    showTime: true,
                    scope: 'TestScope',
                    formatArguments: true,
                    colorEntireRow: false,
                    colorRowLevels: ['info'],
                    // Assuming no custom argsFormatter is provided
                },
                extras: extras
            };

            actualLog(log);

            const expectedExtrasOutput = formatParts(extras); // Format extras using formatParts function
            const expectedOutput = `${formatTime(mockTime)} [TestScope] ${formatType(log.type, log.settings)} ${log.message} ${expectedExtrasOutput}`;
            expect(stripAnsi(consoleOutput)).toBe(stripAnsi(expectedOutput));
        });


        it('should not format extras when formatArguments is false', () => {
            const mockTime = new Date("2024-01-01T12:00:00");
            const extras = ["extra1", "extra2"];
            const log: InternalLog = {
                type: 'info',
                time: mockTime,
                message: 'Test message',
                settings: {
                    showTime: true,
                    scope: 'TestScope',
                    formatArguments: false,
                    colorEntireRow: false,
                    colorRowLevels: ['info'],
                },
                extras: extras
            };

            actualLog(log);

            const expectedOutput = `${formatTime(mockTime)} [TestScope] ${formatType(log.type, log.settings)} ${log.message} ${extras.join(' ')}`;
            expect(stripAnsi(consoleOutput)).toBe(stripAnsi(expectedOutput));
        });

        it('should format extras using custom argsFormatter when provided', () => {
            const mockTime = new Date("2024-01-01T12:00:00");
            const extras = ["extra1", "extra2"];
            const customFormatter = jest.fn((arg, idx, clk) => `Formatted-${arg}`);
            
            const log: InternalLog = {
                type: 'info',
                time: mockTime,
                message: 'Test message with custom formatter',
                settings: {
                    showTime: true,
                    scope: 'TestScope',
                    formatArguments: true,
                    colorEntireRow: false,
                    colorRowLevels: ['info'],
                    argsFormatter: customFormatter,
                },
                extras: extras
            };

            // Reset mock function calls before invoking actualLog
            customFormatter.mockClear();

            actualLog(log);

            const expectedOutput = `${formatTime(mockTime)} [TestScope] ${formatType(log.type, log.settings)} ${log.message} ${extras.map((arg, idx) => customFormatter(arg, idx, chalk)).join(' ')}`;
            expect(stripAnsi(consoleOutput)).toBe(stripAnsi(expectedOutput));
            expect(customFormatter).toHaveBeenCalledTimes(extras.length * 2); // Calls are grouped, so it should be double the amount of the extras
        });



    });
    describe('color function', () => {
        it('should return correct chalk instance for each log type', () => {
            expect(color('debug').toString()).toBe(chalk.ansi256(63).toString());
            expect(color('info').toString()).toBe(chalk.ansi256(86).toString());
            expect(color('warn').toString()).toBe(chalk.ansi256(192).toString());
            expect(color('error').toString()).toBe(chalk.ansi256(204).toString());
            expect(color('fatal').toString()).toBe(chalk.ansi256(134).toString());
            expect(color('test' as any).toString()).toBe(chalk.whiteBright.toString());
        });

        it('should handle custom color maps', () => {
            const customSettings: Settings = {
                showTime: false,
                formatArguments: false,
                colorEntireRow: false,
                colorRowLevels: [],
                customColorMap: {
                    debug: 100, // ANSI color number
                    info: 'green', // Chalk keyword
                    warn: '\u001b[33m', // ANSI color string
                    error: (chalk: Chalk) => chalk.blue, // Chalk function
                    fatal: (chalk: Chalk) => chalk.magenta // Custom function returning a ChalkFunction
                }
            };

            expect(color('debug', customSettings).toString()).toBe(chalk.ansi256(100).toString());
            expect(color('info', customSettings).toString()).toBe(chalk.keyword('green').toString());
            expect(color('warn', customSettings)('test')).toBe('\u001b[33mtest\u001b[0m');
            expect(color('error', customSettings).toString()).toBe(chalk.blue.toString());
            expect(color('fatal', customSettings).toString()).toBe(chalk.magenta.toString());
        });

        it('should handle custom color map functions', () => {
            const customSettingsFunction: Settings = {
                showTime: false,
                formatArguments: false,
                colorEntireRow: false,
                colorRowLevels: [],
                customColorMap: (_, currentStyles) => ({
                    ...currentStyles,
                    debug: (chalk: Chalk) => chalk.yellow
                })
            };
            const col = color('debug', customSettingsFunction)
            console.log(col)
            expect(col("hello")).toBe(chalk.yellow("hello"));
        });
    });

    describe('formatType function', () => {
        it('should return formatted log type', () => {
            expect(formatType('debug')).toBe(chalk.bold(chalk.ansi256(63)('DEBU')));
            expect(formatType('info')).toBe(chalk.bold(chalk.ansi256(86)('INFO')));
            expect(formatType('warn')).toBe(chalk.bold(chalk.ansi256(192)('WARN')));
            expect(formatType('error')).toBe(chalk.bold(chalk.ansi256(204)('ERRO')));
            expect(formatType('fatal')).toBe(chalk.bold(chalk.ansi256(134)('FATA')));
        });

        it('should handle custom color settings in formatType', () => {
            const customSettings = {
                customColorMap: {
                    debug: 100, // Example custom color
                }
            };
            expect(formatType('debug', customSettings as unknown as Settings)).toBe(chalk.bold(chalk.ansi256(100)('DEBU')));
        });
    });

    describe('formatTime function', () => {
        it('should correctly format time', () => {
            const testTime = new Date("2020-01-01T13:15:00"); // 1:15PM
            expect(formatTime(testTime)).toBe('1:15PM');
            const otherTestTime = new Date("2020-01-01T01:15:00"); // 1:15AM
            expect(formatTime(otherTestTime)).toBe('1:15AM');
        });
    });

    describe('groupParts function', () => {
        it('should correctly group parts', () => {
            const parts = ["key1", "value1", "key2", "value2"];
            const grouped = groupParts(...parts);
            expect(grouped).toEqual({"key1": "value1", "key2": "value2"});
        });
    });

    describe('cleanValue function', () => {
        it('should correctly process string values', () => {
            expect(cleanValue('single line')).toEqual([false, chalk.whiteBright('"single line"')]);
            expect(cleanValue('multi\nline')).toEqual([true, `\n  ${chalk.gray('|')} ${chalk.whiteBright('multi')}\n  ${chalk.gray('|')} ${chalk.whiteBright('line')}`]);
        });

        it('should handle non-string values', () => {
            expect(cleanValue(123)).toEqual([false, '123']);
        });
    });

    describe('formatParts function', () => {
        it('should correctly format parts', () => {
            const parts = ["key1", "value1", "key2", "value2"];
            const formatted = formatParts(parts);
            expect(formatted).toBe(`${chalk.gray('key1=')}${chalk.whiteBright('"value1"')} ${chalk.gray('key2=')}${chalk.whiteBright('"value2"')}`);
        });
    });
});
