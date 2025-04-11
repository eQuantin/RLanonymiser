export enum HeaderBodyPropertiesKeys {
    TeamSize = "TeamSize",
    UnfairTeamSize = "UnfairTeamSize",
    Team0Score = "Team0Score",
    Team1Score = "Team1Score",
    Goals = "Goals",
    HighLights = "HighLights",
    PlayerStats = "PlayerStats",
    ReplayVersion = "ReplayVersion",
    ReplayLastSaveVersion = "ReplayLastSaveVersion",
    GameVersion = "GameVersion",
    BuildID = "BuildID",
    Changelist = "Changelist",
    BuildVersion = "BuildVersion",
    ReserveMegabytes = "ReserveMegabytes",
    RecordFPS = "RecordFPS",
    KeyframeDelay = "KeyframeDelay",
    MaxChannels = "MaxChannels",
    MaxReplaySizeMB = "MaxReplaySizeMB",
    Id = "Id",
    MapName = "MapName",
    Date = "Date",
    NumFrames = "NumFrames",
    MatchType = "MatchType",
    PlayerName = "PlayerName",
    ReplayName = "ReplayName",
    MatchStartEpoch = "MatchStartEpoch",
}

export enum HeaderBodyPropertieValueKind {
    IntProperty = "IntProperty",
    StrProperty = "StrProperty",
    BoolProperty = "BoolProperty",
    FloatProperty = "FloatProperty",
    QWordProperty = "QWordProperty",
    ByteProperty = "ByteProperty",
    ArrayProperty = "ArrayProperty",
    NameProperty = "NameProperty",
}

export type HeaderBodyPropertieValue = {
    index: number;
    kind: HeaderBodyPropertieValueKind;
    size: number;
    value: any; // Affine
};

export interface HeaderBodyPropertieValueInt extends HeaderBodyPropertieValue {
    value: {
        int: number;
    };
}

export interface HeaderBodyPropertieValueStr extends HeaderBodyPropertieValue {
    value: {
        str: string;
    };
}

export interface HeaderBodyPropertieValueBool extends HeaderBodyPropertieValue {
    value: {
        bool: 0 | 1;
    };
}

export interface HeaderBodyPropertieValueFloat
    extends HeaderBodyPropertieValue {
    value: {
        float: number;
    };
}

export interface HeaderBodyPropertieValueQWord
    extends HeaderBodyPropertieValue {
    value: {
        q_word: string;
    };
}

export interface HeaderBodyPropertieValueByte extends HeaderBodyPropertieValue {
    value: {
        byte: ["OnlinePlatform", { "Right": string }];
    };
}

export type HeaderBodyProperties = {
    elements: [HeaderBodyPropertiesKeys, HeaderBodyPropertieValue][];
    last_key: string;
};

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
