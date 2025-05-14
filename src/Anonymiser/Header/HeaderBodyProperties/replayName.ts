import { Property, StrValue } from "./abstractProperty.ts";

export default class ReplayNameAnonymiser extends Property<StrValue> {
    anonymise(): void {
        this.value.str = this.replayConfig.replayName;
    }

    public updateSize(): void {
        return;
    }

    public computeSize(): number {
        return this.value.str.length;
    }
}
