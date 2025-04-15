import generatePlayerName from "../generatePlayerName.ts";
import { ArrayValue, BoolValue, ByteValue, PropertieValue, QWordValue, StrValue } from "../anonymiser.ts";
import PlayerIdKey from "./playerIdProperties.ts";
import { findOptionnalKeys, findUnknownKeys } from "../utils.ts";

enum StatKeys {
    Name = "Name",
    Platform = "Platform",
    OnlineID = "OnlineID",
    Team = "Team",
    Score = "Score",
    Goals = "Goals",
    Assists = "Assists",
    Saves = "Saves",
    Shots = "Shots",
    bBot = "bBot",
    PlayerID = "PlayerID", // Optionnal ??
}

type StatArray = [
    StatKeys,
    PropertieValue<any>,
];

function NameKey(element: PropertieValue<StrValue>, guestName: string): PropertieValue<StrValue> {
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

function PlatformKey(element: PropertieValue<ByteValue>): PropertieValue<ByteValue> {
    return {
        ...element,
        size: 27,
        value: {
            byte: [
                "OnlinePlatform",
                {
                    Right: "OnlinePlatform_Unknown",
                },
            ],
        },
    };
}

function OnlineIDKey(element: PropertieValue<QWordValue>): PropertieValue<QWordValue> {
    return {
        ...element,
        size: 8,
        value: {
            q_word: "0",
        },
    };
}

function bBotKey(element: PropertieValue<BoolValue>): PropertieValue<BoolValue> {
    return {
        ...element,
        size: 0,
        value: {
            bool: 1,
        },
    };
}

export default (
    element: PropertieValue<ArrayValue<StatArray>>,
    guestName: string,
): PropertieValue<ArrayValue<StatArray>> => {
    const array = element.value.array.map((stat) => {
        const elements: Map<StatKeys, PropertieValue<any>> = new Map(stat.elements.map((arr) => [arr[0], arr[1]]));

        // DEV TOOLS
        findUnknownKeys(elements, Object.values(StatKeys), "Unknown PlayerStats property keys");
        findOptionnalKeys(elements, Object.values(StatKeys), "Optionnal PlayerStats property keys");

        elements.forEach((value, key) => {
            switch (key) {
                case StatKeys.Name: {
                    elements.set(key, NameKey(value, guestName));
                    break;
                }
                case StatKeys.Platform: {
                    elements.set(key, PlatformKey(value));
                    break;
                }
                case StatKeys.OnlineID: {
                    elements.set(key, OnlineIDKey(value));
                    break;
                }
                case StatKeys.bBot: {
                    elements.set(key, bBotKey(value));
                    break;
                }
                case StatKeys.PlayerID: {
                    elements.set(key, PlayerIdKey(value));
                    break;
                }
                default:
                    break;
            }
        });

        return {
            elements: Array.from(elements),
            last_key: stat.last_key,
        };
    });
    return {
        ...element,
        value: {
            array,
        },
    };
};
