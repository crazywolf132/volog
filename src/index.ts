import type { InternalLog, Settings, Volog } from './types';
import { actualLog } from './utils';

export const createLogger = (): Volog => {
    const logger: Volog = ['debug', 'info', 'warn', 'error', 'fatal', 'settings'].reduce((prev, curr: string) => ({
        ...prev,
        [curr]: curr === 'settings' ? {
            showTime: true,
            formatArguments: true,
            colorEntireRow: false,
            colorRowLevels: ['debug', 'info', 'warn', 'error', 'fatal']
        } as Settings : (message: string, ...rest: unknown[]): void => {
            actualLog({
                type: curr as InternalLog['type'],
                time: new Date(),
                settings: logger.settings,
                message,
                extras: rest
            })
        }
    }), {}) as Volog;

    return logger;
};

export default createLogger();
