import contentBodyFrames, { Frame } from "./ContentBodyFrames/contentBodyFrames.ts";
import { botNames } from "./generatePlayerName.ts";
import keyFrames, { KeyFrame } from "./keyFrames.ts";

type Cache = {
    attribute_mappings: {
        object_id: number;
        stream_id: number;
    }[];
    cache_id: number;
    class_id: number;
    parent_cache_id: number;
};

type ClassMapping = {
    name: string;
    stream_id: number;
};

type ContentBody = {
    caches: Cache[];
    class_mappings: ClassMapping[];
    frames: Frame[];
    key_frames: KeyFrame[];
    levels: string[];
    marks: { frame: number; value: string }[];
    messages: { frame: number; name: string; value: string }[];
    names: string[];
    objects: string[];
    packages: string[];
    stream_size: number;
    unknown: number[];
};

export type Content = {
    body: ContentBody;
    crc: number;
    size: number;
};

export default (content: Content, guestName: string): Content => {
    const addedSize = botNames.map((x) =>
        (x.savedPlayer !== null ? x.savedPlayer.length - x.name.length : x.name.length) * x.changed
    ).reduce((x, y) => x + y);

    // maybe a good idea to dig into the crc value to improve stability
    return {
        crc: content.crc,
        size: content.size += addedSize * 2,
        body: {
            ...content.body,
            messages: [],
            stream_size: content.body.stream_size += addedSize * 2,
            key_frames: keyFrames(content.body.key_frames),
            frames: contentBodyFrames(content.body.frames, guestName),
        },
    };
};
