import type { Chalk, ChalkFunction } from "chalk";

export type InternalLog = {
    type: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
    time: Date;
    message: string;
    settings: Settings;
    extras: unknown[];
}

export type ColorSetting = number | string | ((chalk: Chalk) => ChalkFunction) | ChalkFunction;

export interface CustomColorMap {
  [key: string]: ColorSetting;
}

export type Settings = {
    showTime: boolean;
    formatArguments: boolean;
    argsFormatter?: (arg: unknown, idx: number, chalk: Chalk) => string;
    colorEntireRow: boolean;
    colorRowLevels: InternalLog['type'][];
    customColorMap?: CustomColorMap | ((chalk: Chalk, currentStyles: CustomColorMap) => CustomColorMap);
    scope?: string;
}

export type Volog = {
    debug: (message: string, ...rest: unknown[]) => void;
    info: (message: string, ...rest: unknown[]) => void;
    warn: (message: string, ...rest: unknown[]) => void;
    error: (message: string, ...rest: unknown[]) => void;
    fatal: (message: string, ...rest: unknown[]) => void;
    settings: Settings;
}