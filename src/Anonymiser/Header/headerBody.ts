import AbstractAnonymiser, { ReplayConfig } from "../abstractAnonymiser.ts";
import HeaderBodyPropertiesAnonymiser, { HeaderBodyProperties } from "./HeaderBodyProperties/properties.ts";

export type HeaderBody = {
    engine_version: number;
    label: string;
    licensee_version: number;
    patch_version: number;
    properties: HeaderBodyProperties;
};

export default class HeaderBodyAnonymiser extends AbstractAnonymiser<HeaderBody> {
    // Data
    private readonly engine_version: number;
    private readonly licensee_version: number;
    private readonly patch_version: number;
    private readonly label: string;
    private properties: HeaderBodyProperties;

    // Anonymisers
    private propertiesAnonymiser: HeaderBodyPropertiesAnonymiser;

    constructor(headerBody: HeaderBody, replayConfig: ReplayConfig) {
        super(replayConfig, 0);
        this.engine_version = headerBody.engine_version;
        this.label = headerBody.label;
        this.licensee_version = headerBody.licensee_version;
        this.patch_version = headerBody.patch_version;
        this.properties = headerBody.properties;
        this.propertiesAnonymiser = new HeaderBodyPropertiesAnonymiser(headerBody.properties, replayConfig);
    }

    public anonymise(): void {
        this.propertiesAnonymiser.anonymise();
        this.properties = this.propertiesAnonymiser.convert();
        this.updateSize();
    }

    public updateSize(): void {
        let newSize = this.originalSize;
        newSize += this.propertiesAnonymiser.getSizeDifference();
        this.size = newSize;
    }

    public convert(): HeaderBody {
        return {
            engine_version: this.engine_version,
            label: this.label,
            licensee_version: this.licensee_version,
            patch_version: this.patch_version,
            properties: this.properties,
        };
    }
}
