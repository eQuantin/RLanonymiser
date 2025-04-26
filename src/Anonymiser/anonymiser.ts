import anoContent, { Content } from "./content.ts";
import { resetBotNames } from "./generatePlayerName.ts";
import anoHeader, { Header } from "./header.ts";

export enum ValueKind {
    IntProperty = "IntProperty",
    StrProperty = "StrProperty",
    BoolProperty = "BoolProperty",
    FloatProperty = "FloatProperty",
    QWordProperty = "QWordProperty",
    ByteProperty = "ByteProperty",
    ArrayProperty = "ArrayProperty",
    NameProperty = "NameProperty",
    StructProperty = "StructProperty",
}

export type PropertieValue<T> = {
    index: number;
    kind: ValueKind;
    size: number;
    value: T;
};
export type IntValue = { int: number };
export type StrValue = { str: string };
export type BoolValue = { bool: 0 | 1 };
export type FloatValue = {
    float: number;
};
export type QWordValue = {
    q_word: string;
};
export type ByteValue = {
    byte: any;
};
export type ArrayValue<T> = {
    array: {
        elements: T[];
        last_key: "None";
    }[];
};
export type NameValue = {
    name: string;
};
export type StructValue<T> = {
    struct: {
        fields: {
            elements: T[];
            last_key: "None";
        };
        name: string;
    };
};

export type Replay = {
    $schema: never;
    content: Content;
    header: Header;
};

export default (replay: Replay, replayName: string, guestName: string): Replay => {
    // $schema can be ignored

    const content = anoContent(replay.content, guestName);

    // reset botnames counters
    resetBotNames();

    const header = anoHeader(replay.header, replayName, guestName);

    return {
        $schema: replay.$schema,
        content,
        header,
    };
};
