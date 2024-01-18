import log from '../../dist';

function startOven(degree: number): void {
    log.debug("Starting oven", "temperature", degree)
}

var cup = Number

function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

(async () => {
    var butter = cup(1);
    var chocolate = cup(2);
    var flour = cup(3);
    var sugar = cup(5);
    var temp = 375
    var bakeTime = 10

    startOven(temp)
    setTimeout(() => {}, 1000)
    log.debug("Mixing ingredients", "ingredients", [
        `${butter} cups of butter`,
        `${chocolate} cups of chocolate`,
        `${flour} cups of flour`,
        `and ${sugar} cups of sugar`
    ].join("\n"))

    await sleep(1000)

    if (sugar > 2) {
        log.warn(`That's a log of sugar`, "amount", sugar)
    }

    log.info("Baking cookies", "time", `${bakeTime} minutes`)
    await sleep(1000 * 2)

    log.info("Increasing temperature", "amount", 300)
    temp += 300
    setTimeout(() => {}, 1000)
    if (temp > 500) {
        log.error("Oven is too hot", "temperature", temp)
        log.fatal("The kitchen is on fire 🔥")
    }
})()