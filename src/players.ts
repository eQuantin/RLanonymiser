import bots from "./bots.ts";

/**
 * Static class to manage available bot names and their assignment to players.
 */
class BotNameManager {
    /**
     * Array of available bots with their names, product IDs, and associated players.
     * @private
     * @static
     */
    private static availableBots: {
        name: string;
        botProductName: number;
        savedPlayer: Player | null;
    }[] = bots.map((name, index) => ({
        name,
        botProductName: index + 1000,
        savedPlayer: null,
    }));

    /**
     * Assigns a random available bot to a player.
     * @param player The player to assign a bot to.
     * @returns An object containing the assigned bot's name and product ID.
     * @throws Error if no bot names are available.
     * @static
     */
    public static assignBot(player: Player): { name: string; botProductName: number } {
        const availableBots = this.availableBots.filter((bot) => bot.savedPlayer === null);
        if (availableBots.length === 0) {
            throw new Error("No available bot names");
        }

        const randomIndex = Math.floor(Math.random() * availableBots.length);
        const selectedBot = availableBots[randomIndex];
        const botIndex = this.availableBots.findIndex((bot) => bot.name === selectedBot.name);

        this.availableBots[botIndex].savedPlayer = player;

        return {
            name: this.availableBots[botIndex].name,
            botProductName: this.availableBots[botIndex].botProductName,
        };
    }
}

/**
 * Represents a player in the game, managing both their original name and assigned bot name.
 */
class Player {
    private readonly _playerName: string;
    /**
     * Gets the player's original name. Increments the counter each time it's accessed.
     * @returns The player's original name.
     */
    public get playerName(): string {
        this._counter++;
        return this._playerName;
    }

    private readonly _botName: string;
    /**
     * Gets the assigned bot name for this player.
     * @returns The assigned bot name.
     */
    public get botName(): string {
        return this._botName;
    }

    private readonly _botProductName: number;
    /**
     * Gets the bot product name (a unique identifier) for this player.
     * @returns The bot product name.
     */
    public get botProductName(): number {
        return this._botProductName;
    }

    private _counter: number = 0;
    /**
     * Gets the number of times the player's name has been accessed.
     * @returns The access counter.
     */
    public get counter(): number {
        return this._counter;
    }

    /**
     * Creates a new Player instance.
     * @param playerName The original name of the player.
     */
    constructor(playerName: string) {
        this._playerName = playerName;
        const newBot = BotNameManager.assignBot(this);
        this._botName = newBot.name;
        this._botProductName = newBot.botProductName;
        this._counter = 0;
    }

    /**
     * Gets the length of the player's original name.
     * @returns The length of the player's name.
     */
    public getSize(): number {
        return this._playerName.length;
    }

    /**
     * Calculates the difference in byte size between the player's original name and the assigned bot name.
     * Extended ASCII characters take 2 bytes, while regular ASCII characters take 1 byte.
     * @returns The difference in byte size.
     */
    public getSizeDifference(): number {
        const playerNameBytes = [...this._playerName].reduce(
            (acc, char) => acc + (char.charCodeAt(0) > 127 ? 2 : 1),
            0,
        );
        const botNameBytes = [...this._botName].reduce((acc, char) => acc + (char.charCodeAt(0) > 127 ? 2 : 1), 0);
        return playerNameBytes - botNameBytes;
    }

    /**
     * Calculates the total size difference for all occurrences of the player's name.
     * @returns The total size difference.
     */
    public getTotalSizeDifferenceForAllOccurrences(): number {
        return this.getSizeDifference() * this.counter;
    }

    /**
     * Resets the counter that tracks how many times the player's name has been accessed.
     */
    public resetCounter(): void {
        this._counter = 0;
    }
}

/**
 * Represents a collection of players in the game.
 */
export class Players {
    private readonly _players: Player[];

    /**
     * Creates a new Players instance.
     * @param playerNames An array of player names to initialize the collection.
     */
    constructor(playerNames: string[]) {
        this._players = playerNames.map((name) => new Player(name));
    }

    /**
     * Gets all players in the collection.
     * @returns An array of Player objects.
     */
    public get players(): Player[] {
        return this._players;
    }

    /**
     * Retrieves a specific player by their name.
     * @param playerName The name of the player to find.
     * @returns The Player object matching the given name.
     * @throws Error if the player is not found.
     */
    public getPlayer(playerName: string): Player {
        const player = this._players.find((player) => player.playerName === playerName);
        if (!player) {
            throw new Error(`Player ${playerName} not found`);
        }
        return player;
    }

    /**
     * Gets an array of all player names in the collection.
     * @returns An array of player names.
     */
    public getPlayerNames(): string[] {
        return this._players.map((player) => player.playerName);
    }

    /**
     * Calculates the total size difference for all players and resets their counters.
     * @returns The total size difference across all players.
     */
    public getTotalSizeDifferenceAndReset(): number {
        const totalSizeDifference = this._players.map((player) => player.getTotalSizeDifferenceForAllOccurrences())
            .reduce(
                (a, b) => a + b,
                0,
            );
        this.resetCounters();
        return totalSizeDifference;
    }

    /**
     * Resets the counters for all players in the collection.
     */
    public resetCounters(): void {
        this._players.forEach((player) => player.resetCounter());
    }
}
