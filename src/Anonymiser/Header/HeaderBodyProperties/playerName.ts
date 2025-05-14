import { Property, StrValue } from "./abstractProperty.ts";

export default class PlayerNameAnonymiser extends Property<StrValue> {
    anonymise(): void {
        this.value.str = this.replayConfig.players.getPlayer(this.value.str).botName;
    }

    public updateSize(): void {
        return;
    }

    public computeSize(): number {
        return this.value.str.length;
    }
}
