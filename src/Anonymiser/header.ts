import { botNames } from "./generatePlayerName.ts";
import headerBodyProperties, { HeaderBodyProperties } from "./HeaderBodyProperties/headerBodyProperties.ts";

export type HeaderBody = {
    engine_version: number;
    label: string;
    licensee_version: number;
    patch_version: number;
    properties: HeaderBodyProperties;
};

export type Header = {
    body: HeaderBody;
    crc: number;
    size: number;
};

export default (header: Header, replayName: string, guestName: string): Header => {
    const addedSize = botNames.map((x) =>
        (x.savedPlayer !== null ? x.savedPlayer.length - x.name.length : x.name.length) * x.changed
    ).reduce((x, y) => x + y);

    // maybe a good idea to dig into the crc value to improve stability
    // in header.body we can ignore everything except properties
    return {
        crc: header.crc,
        size: header.size += addedSize * 2,
        body: {
            ...header.body,
            properties: headerBodyProperties(
                header.body.properties,
                replayName,
                guestName,
            ),
        },
    };
};
