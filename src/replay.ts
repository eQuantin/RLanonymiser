export type ReplayData = any;
export type Player = any;

export class Replay {
    constructor(private replayData: ReplayData) {}

    getPlayersName(): string[] {
        return [
            ...this.replayData.orange.players.map((p: Player) => p.name),
            ...this.replayData.blue.players.map((p: Player) => p.name),
        ];
    }

    getPlayers(): { orange: Player[]; blue: Player[] } {
        return {
            orange: this.replayData.orange.players,
            blue: this.replayData.blue.players,
        };
    }
}
