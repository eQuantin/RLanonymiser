import { ByteValue, PropertieValue, QWordValue, StructValue, StrValue } from "../anonymiser.ts";
import { findOptionnalKeys, findUnknownKeys } from "../utils.ts";

enum PlayerIDKeys {
    Uid = "Uid",
    NpId = "NpId",
    EpicAccountId = "EpicAccountId",
    Platform = "Platform",
    SplitscreenID = "SplitscreenID",
}

enum NpIdKeys {
    Handle = "Handle",
    Opt = "Opt",
    Reserved = "Reserved",
}

enum HandleKeys {
    Data = "Data",
    Term = "Term",
    Dummy = "Dummy",
}

function UidKey(element: PropertieValue<QWordValue>): PropertieValue<QWordValue> {
    return {
        ...element,
        value: {
            q_word: "0",
        },
    };
}

function EpicAccountIdKey(element: PropertieValue<StrValue>): PropertieValue<StrValue> {
    return {
        ...element,
        value: {
            str: "",
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
                    "Right": "OnlinePlatform_Unknown",
                },
            ],
        },
    };
}

function DataKey(element: PropertieValue<QWordValue>): PropertieValue<QWordValue> {
    return {
        ...element,
        value: { q_word: "0" },
    };
}

function HandleKey(element: PropertieValue<StructValue<any>>): PropertieValue<StructValue<any>> {
    const elements: Map<HandleKeys, PropertieValue<any>> = new Map(
        element.value.struct.fields.elements.map((arr) => [arr[0], arr[1]]),
    );

    // DEV TOOLS
    findUnknownKeys(elements, Object.values(HandleKeys), "Unknown HandleKey keys");
    findOptionnalKeys(elements, Object.values(HandleKeys), "Optionnal HandleKey keys");

    elements.forEach((value, key) => {
        switch (key) {
            case HandleKeys.Data: {
                elements.set(key, DataKey(value));
                break;
            }
            default:
                break;
        }
    });

    return {
        ...element,
        value: {
            struct: {
                fields: {
                    elements: Array.from(elements),
                    last_key: element.value.struct.fields.last_key,
                },
                name: element.value.struct.name,
            },
        },
    };
}

function OptKey(element: PropertieValue<QWordValue>): PropertieValue<QWordValue> {
    return {
        ...element,
        value: {
            q_word: "0",
        },
    };
}

function ReservedKey(element: PropertieValue<QWordValue>): PropertieValue<QWordValue> {
    return {
        ...element,
        value: {
            q_word: "0",
        },
    };
}

function NpIdKey(element: PropertieValue<StructValue<any>>): PropertieValue<StructValue<any>> {
    const elements: Map<NpIdKeys, PropertieValue<any>> = new Map(
        element.value.struct.fields.elements.map((arr) => [arr[0], arr[1]]),
    );

    // DEV TOOLS
    findUnknownKeys(elements, Object.values(NpIdKeys), "Unknown NpIdKey keys");
    findOptionnalKeys(elements, Object.values(NpIdKeys), "Optionnal NpIdKey keys");

    elements.forEach((value, key) => {
        switch (key) {
            case NpIdKeys.Handle: {
                elements.set(key, HandleKey(value));
                break;
            }
            case NpIdKeys.Opt: {
                elements.set(key, OptKey(value));
                break;
            }
            case NpIdKeys.Reserved: {
                elements.set(key, ReservedKey(value));
                break;
            }
            default:
                break;
        }
    });

    return {
        ...element,
        value: {
            struct: {
                fields: {
                    elements: Array.from(elements),
                    last_key: element.value.struct.fields.last_key,
                },
                name: element.value.struct.name,
            },
        },
    };
}

export default (element: PropertieValue<StructValue<any>>): PropertieValue<StructValue<any>> => {
    const elements: Map<PlayerIDKeys, PropertieValue<any>> = new Map(
        element.value.struct.fields.elements.map((arr) => [arr[0], arr[1]]),
    );

    // DEV TOOLS
    findUnknownKeys(elements, Object.values(PlayerIDKeys), "Unknown PlayerID keys");
    findOptionnalKeys(elements, Object.values(PlayerIDKeys), "Optionnal PlayerID keys");

    elements.forEach((value, key) => {
        switch (key) {
            case PlayerIDKeys.Uid: {
                elements.set(key, UidKey(value));
                break;
            }
            case PlayerIDKeys.NpId: {
                elements.set(key, NpIdKey(value));
                break;
            }
            case PlayerIDKeys.EpicAccountId: {
                elements.set(key, EpicAccountIdKey(value));
                break;
            }
            case PlayerIDKeys.Platform: {
                elements.set(key, PlatformKey(value));
                break;
            }
            default:
                break;
        }
    });

    return {
        ...element,
        value: {
            struct: {
                fields: {
                    elements: Array.from(elements),
                    last_key: element.value.struct.fields.last_key,
                },
                name: element.value.struct.name,
            },
        },
    };
};
