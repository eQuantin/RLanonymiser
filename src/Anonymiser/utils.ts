import { PropertieValue } from "./anonymiser.ts";

// Find unknow keys in a replay
export function findUnknownKeys<K extends {}>(
    elements: Map<K, PropertieValue<any>>,
    enumKeys: K[],
    logAnchor: string,
) {
    const keys = Array.from(elements.keys());
    for (const k of keys) {
        if (
            !enumKeys.includes(
                k as K,
            )
        ) {
            console.debug(logAnchor, k);
        }
    }
}

// Find optionnal keys in a replay
export function findOptionnalKeys<K extends {}>(
    elements: Map<K, PropertieValue<any>>,
    enumKeys: K[],
    logAnchor: string,
) {
    const keys = Array.from(elements.keys());
    const pkeys = enumKeys;
    for (const k of keys) {
        const f = pkeys.findIndex((p) => p == k);
        if (f > -1) {
            pkeys.splice(f, 1);
        }
    }
    if (pkeys.length > 0) {
        console.debug(logAnchor, pkeys);
    }
}
