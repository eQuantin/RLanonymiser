import { Property, QWordValue } from "./abstractProperty.ts";

export default class MatchStartEpochAnonymiser extends Property<QWordValue> {
    anonymise(): void {
        this.value.q_word = this.replayConfig.date.getTime().toString().slice(
            0,
            10,
        );
    }

    public updateSize(): void {
        return;
    }

    computeSize(): number {
        return this.value.q_word.length;
    }
}
