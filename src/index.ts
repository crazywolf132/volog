import chalk from 'chalk';

type InternalLog = {
    type: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
    time: Date;
    message: string;
    extras: unknown[];
}

const actualLog = (log: InternalLog) => {
    console.log(chalk.whiteBright([formatTime(log.time), formatType(log.type), log.message, formatParts(log.extras)].join(' ')))
}

const color = (type: InternalLog['type']) => {
    switch (type.toLowerCase()) {
        case 'debug':
            return 63;
        case 'info':
            return 86;
        case 'warn':
            return 192;
        case 'error':
            return 204;
        case 'fatal':
            return 134;
        default:
            return 0;
    }

}

const formatType = (type: InternalLog['type']) => {
    return `${chalk.bold.ansi256(color(type))(String(type).toUpperCase().slice(0, 4))}`
}

const formatTime = (time: InternalLog['time']) => {
    let hours = time.getHours();
    const minutes = time.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const minutesStr = minutes < 10 ? '0' + minutes : minutes.toString();

    return `${hours}:${minutesStr}${ampm.toUpperCase()}`;
}

const groupParts = (...parts: unknown[]) => {
    const result: Record<string, unknown> = {};

    for (let i = 0; i < parts.length; i += 2) {
        const key = parts[i];
        const value = parts[i + 1];

        // Check if the key is a string to use it.
        result[String(key)] = value;
    }

    return result;
}

const cleanValue = (value: unknown): [boolean, string] => {
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

const formatParts = (parts: InternalLog['extras']) => {
    const matched = groupParts(...parts);
    const result: string[] = [];

    for (const [key, value] of Object.entries(matched)) {
        let [nextLine, newValue] = cleanValue(value)
        result.push(`${nextLine ? "\n  " : ""}${chalk.gray(`${key}=`)}${newValue}`);
    }

    return result.join(' ');
}


const toExport = ['debug', 'info', 'warn', 'error', 'fatal'].reduce((prev, curr: string) => ({
    ...prev,
    [curr]: (message: string, ...rest: unknown[]): void => {
        actualLog({
            type: curr as InternalLog['type'],
            time: new Date(),
            message,
            extras: rest
        })
    }
}), {})

export default toExport;