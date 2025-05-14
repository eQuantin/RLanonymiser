import AbstractAnonymiser, { ReplayConfig } from "./abstractAnonymiser.ts";
import { Content } from "./content.ts";
import HeaderAnonymiser, { Header } from "./Header/header.ts";

export type Replay = {
    content: Content;
    header: Header;
};

export default class ReplayAnonymiser extends AbstractAnonymiser<Replay> {
    // Data
    private content: Content;
    private header: Header;

    // Anonymisers
    private headerAnonymiser: HeaderAnonymiser;

    constructor(replay: Replay, replayConfig: ReplayConfig) {
        super(replayConfig, 0);
        this.content = replay.content;
        this.header = replay.header;
        this.headerAnonymiser = new HeaderAnonymiser(replay.header, this.replayConfig);
    }

    public anonymise(): void {
        this.headerAnonymiser.anonymise();
        this.header = this.headerAnonymiser.convert();
        this.updateSize();
    }

    public updateSize(): void {
        let newSize = this.originalSize;
        newSize += this.headerAnonymiser.getSizeDifference();
        this.size = newSize;
    }

    public convert(): Replay {
        return {
            content: this.content,
            header: this.header,
        };
    }
}
