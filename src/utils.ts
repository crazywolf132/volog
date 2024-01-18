import chalk from 'chalk';
import type { CustomColorMap, InternalLog, Settings } from "./types";

export const defaultColorMap: CustomColorMap = {
    debug: 63,
    info: 86,
    warn: 192,
    error: 204,
    fatal: 134
};

export const color = (type: InternalLog['type'], settings?: Settings): Function => {
    let colorMap = defaultColorMap;

    if (settings && settings.customColorMap) {
        if (typeof settings.customColorMap === 'function') {
            colorMap = settings.customColorMap(chalk, defaultColorMap);
        } else {
            colorMap = { ...defaultColorMap, ...settings.customColorMap };
        }
    }

    const colorSetting = colorMap[type.toLowerCase()];
    if (typeof colorSetting === 'string' && colorSetting.startsWith('\u001b[')) {
        return (msg: string) => `${colorSetting}${msg}\u001b[0m`; // Return a function to wrap the message with the ANSI color and reset afterwards
    } else if (typeof colorSetting === 'number') {
        return chalk.ansi256(colorSetting);
    } else if (typeof colorSetting === 'string') {
        return chalk.keyword(colorSetting);
    } else if (typeof colorSetting === 'function') {
        return colorSetting(chalk) as Function;
    } else {
        return chalk.whiteBright; // Default color
    }
}

export const actualLog = (log: InternalLog) => {
    const parts: string[] = [];

    if (log.settings.showTime) {
        parts.push(formatTime(log.time));
    }
    if (log.settings.scope) {
        parts.push(`[${log.settings.scope}]`);
    }
    parts.push(formatType(log.type, log.settings));
    parts.push(log.message);
    if (log.settings.formatArguments) {
        if (log.settings.argsFormatter) {
            parts.push(...log.extras.map((arg, idx) => log.settings.argsFormatter!(arg, idx, chalk)));
        } else {
            parts.push(formatParts(log.extras));
        }
    } else {
        parts.push(...log.extras.map(String))
    }

    const rowColor = log.settings.colorEntireRow ? log.settings.colorRowLevels.includes(log.type)? color(log.type, log.settings) : chalk.whiteBright : chalk.whiteBright;
    
    console.log(rowColor(parts.join(' ')))
}

export const formatType = (type: InternalLog['type'], settings?: Settings) => {
    const colorChalk = color(type, settings);
    return chalk.bold(colorChalk(String(type).toUpperCase().slice(0, 4)));
}

export const formatTime = (time: InternalLog['time']) => {
    let hours = time.getHours();
    const minutes = time.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const minutesStr = minutes < 10 ? '0' + minutes : minutes.toString();

    return `${hours}:${minutesStr}${ampm.toUpperCase()}`;
}

export const groupParts = (...parts: unknown[]) => {
    const result: Record<string, unknown> = {};

    for (let i = 0; i < parts.length; i += 2) {
        const key = parts[i];
        const value = parts[i + 1];

        // Check if the key is a string to use it.
        result[String(key)] = value;
    }

    return result;
}

export const cleanValue = (value: unknown): [boolean, string] => {
    if (typeof value === 'string') {
        if (value.includes("\n")) {
            // We are going to split the string and modify each part.
            const parts = value.split("\n");
            const result: string[] = [];
            for (const part of parts) {
                result.push(chalk.gray('|') + " " + chalk.whiteBright(part));
            }
            return [true, `\n  ${result.join("\n  ")}`];
        }
        return [false, chalk.whiteBright(`"${value}"`)]
    }

    return [false, String(value)]
}

export const formatParts = (parts: InternalLog['extras']) => {
    const matched = groupParts(...parts);
    const result: string[] = [];

    for (const [key, value] of Object.entries(matched)) {
        let [nextLine, newValue] = cleanValue(value)
        result.push(`${nextLine ? "\n  " : ""}${chalk.gray(`${key}=`)}${newValue}`);
    }

    return result.join(' ');
}