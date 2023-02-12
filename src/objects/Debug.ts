export default class Debug {
    printedTimes: number = 0;
    printedOnce: boolean = false;
    executeOnce(callback: () => any) {
        if (!this.printedOnce) {
            callback();
            this.printedOnce = true;
        }
    }
    executeUntil(howManyTimes: number, callback: () => any) {
        if (this.printedTimes < howManyTimes) {
            callback();
            ++this.printedTimes;
        }
    }
}