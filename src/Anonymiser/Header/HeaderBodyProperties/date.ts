import { Property, StrValue } from "./abstractProperty.ts";

export default class DateAnonymiser extends Property<StrValue> {
    anonymise() {
        const date = this.replayConfig.date;
        this.value.str = `${this.replayConfig.date.getFullYear()}-${
            date.getMonth() + 1
        }-${date.getDate()} ${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}`;
        return {
            index: this.index,
            kind: this.kind,
            size: this.size,
            value: this.value,
        };
    }

    computeSize(): number {
        return this.value.str.length;
    }
}
