import PlayerStatsKey from "./playerStatsProperties.ts";
import { ArrayValue, IntValue, PropertieValue, QWordValue, StrValue, ValueKind } from "../anonymiser.ts";
import generatePlayerName from "../generatePlayerName.ts";
import { findOptionnalKeys, findUnknownKeys } from "../utils.ts";

enum PropertiesKeys {
    Date = "Date",
    Goals = "Goals",
    Id = "Id",
    KeyframeDelay = "KeyframeDelay",
    MapName = "MapName",
    MatchType = "MatchType",
    MaxChannels = "MaxChannels",
    MaxReplaySizeMB = "MaxReplaySizeMB",
    NumFrames = "NumFrames",
    PlayerName = "PlayerName",
    PlayerStats = "PlayerStats",
    RecordFPS = "RecordFPS",
    TeamSize = "TeamSize",

    BuildID = "BuildID", // Optionnal
    BuildVersion = "BuildVersion", // Optionnal
    Changelist = "Changelist", // Optionnal
    GameVersion = "GameVersion", // Optionnal
    HighLights = "HighLights", // Optionnal
    MatchGuid = "MatchGuid", // Optionnal
    MatchStartEpoch = "MatchStartEpoch", // Optionnal
    PrimaryPlayerTeam = "PrimaryPlayerTeam", // Optionnal
    ReplayLastSaveVersion = "ReplayLastSaveVersion", // Optionnal
    ReplayName = "ReplayName", // Optionnal
    ReplayVersion = "ReplayVersion", // Optionnal
    ReserveMegabytes = "ReserveMegabytes", // Optionnal
    Team0Score = "Team0Score", // Optionnal
    Team1Score = "Team1Score", // Optionnal
    TotalSecondsPlayed = "TotalSecondsPlayed", // Optionnal
    UnfairTeamSize = "UnfairTeamSize", // Optionnal
}

export type HeaderBodyProperties = {
    elements: [PropertiesKeys, PropertieValue<any>][];
    last_key: string;
};

enum GoalKeys {
    frame = "frame",
    PlayerName = "PlayerName",
    PlayerTeam = "PlayerTeam",
}

type GoalsArray = [
    GoalKeys,
    PropertieValue<IntValue | StrValue>,
];

function PlayerNameKey(element: PropertieValue<StrValue>, guestName: string): PropertieValue<StrValue> {
    const newPlayerInfo = generatePlayerName(
        element.value.str,
        guestName,
    );
    return {
        ...element,
        size: newPlayerInfo.name.length,
        value: {
            str: newPlayerInfo.name,
        },
    };
}

function GoalsKey(
    element: PropertieValue<ArrayValue<GoalsArray>>,
    guestName: string,
): PropertieValue<ArrayValue<GoalsArray>> {
    const array = element.value.array.map((goal) => {
        const elements: Map<GoalKeys, PropertieValue<any>> = new Map(
            goal.elements.map((arr) => [arr[0], arr[1]]),
        );

        elements.forEach((value, key) => {
            switch (key) {
                case GoalKeys.PlayerName: {
                    elements.set(key, PlayerNameKey(value, guestName));
                    break;
                }
                default:
                    break;
            }
        });

        return {
            elements: Array.from(elements),
            last_key: goal.last_key,
        };
    });

    return {
        ...element,
        value: {
            array,
        },
    };
}

function ReplayNameKey(
    element: PropertieValue<StrValue>,
    replayName: string,
): PropertieValue<StrValue> {
    element.value.str = replayName;
    element.size = element.value.str.length;
    return element;
}

function MatchStartEpochKey(
    element: PropertieValue<QWordValue>,
    date: Date,
): PropertieValue<QWordValue> {
    element.value.q_word = date.getTime().toString().slice(
        0,
        10,
    );
    return element;
}

function DateKey(
    element: PropertieValue<StrValue>,
    date: Date,
): PropertieValue<StrValue> {
    element.value.str = `${date.getFullYear()}-${
        date.getMonth() + 1
    }-${date.getDate()} ${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}`;
    return element;
}

export default (
    headerBodyProperties: HeaderBodyProperties,
    replayName: string,
    guestName: string,
): HeaderBodyProperties => {
    const date: Date = new Date();
    const elements: Map<
        PropertiesKeys,
        PropertieValue<any>
    > = new Map(
        headerBodyProperties.elements.map((arr) => [arr[0], arr[1]]),
    );

    // DEV TOOLS
    findUnknownKeys(elements, Object.values(PropertiesKeys), "Unknown HeaderBodyProperties keys");
    findOptionnalKeys(elements, Object.values(PropertiesKeys), "Optionnal HeaderBodyProperties keys");

    elements.forEach((value, key) => {
        switch (key) {
            case PropertiesKeys.Goals: {
                elements.set(key, GoalsKey(value, guestName));
                break;
            }
            case PropertiesKeys.PlayerStats: {
                elements.set(key, PlayerStatsKey(value, guestName));
                break;
            }
            case PropertiesKeys.ReplayName: {
                elements.set(key, ReplayNameKey(value, replayName));
                break;
            }
            case PropertiesKeys.MatchStartEpoch: {
                elements.set(key, MatchStartEpochKey(value, date));
                break;
            }
            case PropertiesKeys.Date: {
                elements.set(key, DateKey(value, date));
                break;
            }
            default:
                break;
        }
    });

    if (!elements.has(PropertiesKeys.ReplayName)) {
        elements.set(
            PropertiesKeys.ReplayName,
            ReplayNameKey({
                index: 0,
                kind: ValueKind.StrProperty,
                size: 0,
                value: {
                    str: "",
                },
            }, replayName),
        );
    }

    return {
        elements: Array.from(elements),
        last_key: headerBodyProperties.last_key,
    };
};
