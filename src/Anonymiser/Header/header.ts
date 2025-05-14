import AbstractAnonymiser, { ReplayConfig } from "../abstractAnonymiser.ts";
import HeaderBodyAnonymiser, { HeaderBody } from "./headerBody.ts";

export type Header = {
    body: HeaderBody;
    crc: number;
    size: number;
};

export default class HeaderAnonymiser extends AbstractAnonymiser<Header> {
    // Header data
    private body: HeaderBody;
    private crc: number;

    // Anonymisers
    private bodyAnonymiser: HeaderBodyAnonymiser;

    constructor(header: Header, replayConfig: ReplayConfig) {
        super(replayConfig, header.size);
        this.body = header.body;
        this.crc = header.crc;
        this.bodyAnonymiser = new HeaderBodyAnonymiser(header.body, replayConfig);
    }

    public anonymise(): void {
        this.bodyAnonymiser.anonymise();
        this.body = this.bodyAnonymiser.convert();
        this.updateSize();
    }

    public updateSize(): void {
        let newSize = this.originalSize;
        newSize += this.bodyAnonymiser.getSizeDifference();
        this.size = newSize;
    }

    public convert(): Header {
        return {
            body: this.body,
            crc: this.crc,
            size: this.size,
        };
    }
}
