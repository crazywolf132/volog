import type { InternalLog, Settings, Volog } from './types';
import { actualLog } from './utils';


const toExport: Volog = ['debug', 'info', 'warn', 'error', 'fatal', 'settings'].reduce((prev, curr: string) => ({
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
            settings: toExport.settings,
            message,
            extras: rest
        })
    }
}), {}) as Volog;

export default toExport;