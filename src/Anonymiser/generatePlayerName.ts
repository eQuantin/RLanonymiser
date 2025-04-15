import bots from "../bots.ts";

export const botNames: {
    name: string;
    botProductName: number;
    savedPlayer: string | null;
    changed: number;
}[] = bots.map((name, index) => ({
    name,
    botProductName: index + 1000,
    savedPlayer: null,
    changed: 0,
}));

export function resetBotNames(): void {
    botNames.map((b) => b.changed = 0);
}

export default (
    playerName: string,
    guestName: string,
): { name: string; botProductName: number | null } => {
    if (playerName == undefined) {
        throw new Error("PlayerName is undefined");
    }

    const playerIndex = botNames.findIndex((x) => x.savedPlayer == playerName);
    const player = botNames[playerIndex];
    if (playerIndex == -1) {
        const random = Math.floor(
            Math.random() *
                (botNames.filter((x) => x.savedPlayer == null).length),
        );
        const nameIndex = botNames.findIndex((y) =>
            y.name ==
                botNames.filter((x) => x.savedPlayer == null)[random]
                    .name
        );
        botNames[nameIndex].savedPlayer = playerName;
        botNames[nameIndex].changed++;
        return guestName !== null && playerName == guestName ? { name: "Guest", botProductName: 999 } : {
            name: botNames[nameIndex].name,
            botProductName: botNames[nameIndex].botProductName,
        };
    } else {
        botNames[playerIndex].changed++;
        return guestName !== null && playerName == guestName
            ? { name: "Guest", botProductName: 999 }
            : { name: player.name, botProductName: player.botProductName };
    }
};
