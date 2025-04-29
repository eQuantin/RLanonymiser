export interface Player {
    name: string;
    // Add other properties of a player if needed
}

export interface Team {
    players: Player[];
    // Add other properties of a team if needed
}

export interface ReplayInfo {
    orange: Team;
    blue: Team;
    // Add other properties of replay info if needed
}

export class Ballchasing {
    protected ballchasingUrl = "https://ballchasing.com/api";
    private ballchasingToken: string;

    constructor(
        ballchasingToken?: string,
        private workdir?: string,
        private debug: boolean = false,
    ) {
        if (!debug && !workdir) {
            throw new Error();
        }
        if (!ballchasingToken) {
            throw new Error();
        }
        this.ballchasingToken = ballchasingToken;
    }

    async ping(): Promise<number> {
        console.debug("Ping Ballchasing API", this.ballchasingUrl);
        const response = await fetch(this.ballchasingUrl, {
            headers: {
                accept: "application/json",
                "Authorization": this.ballchasingToken,
            },
        });
        console.debug("Ping response status", response.status);
        return response.status;
    }

    async getReplayInfo(ballchasingId: string): Promise<ReplayInfo> {
        const url = `${this.ballchasingUrl}/replays/${ballchasingId}`;
        console.debug("Fetching replay informations", url);
        const response = await fetch(
            url,
            {
                headers: {
                    accept: "application/json",
                    "Authorization": this.ballchasingToken,
                },
            },
        );
        if (response.status != 200) {
            console.error(response.status);
            throw new Error();
        } else {
            const arrayBuffer = await response.arrayBuffer();
            if (this.debug && this.workdir) {
                Deno.writeFileSync(
                    `${this.workdir}/replayInfo.json`,
                    new Uint8Array(arrayBuffer),
                );
            }
            return JSON.parse(
                new TextDecoder().decode(new Uint8Array(arrayBuffer)),
            ) as ReplayInfo;
        }
    }

    async downloadReplayFile(
        ballchasingId: string,
    ): Promise<{ bin: Uint8Array; path?: string }> {
        const response = await fetch(
            `${this.ballchasingUrl}/replays/${ballchasingId}/file`,
            {
                headers: {
                    accept: "application/json",
                    "Authorization": this.ballchasingToken,
                },
            },
        );

        // Watch out for rate limits !
        if (response.status !== 200) {
            console.error(`Error: Received status ${response.status}`);
            throw new Error(
                `Failed to download replay file, status code: ${response.status}`,
            );
        }

        const arrayBuffer = await response.arrayBuffer();

        if (this.debug && this.workdir) {
            const path = `${this.workdir}/${ballchasingId}.replay`;
            Deno.writeFileSync(
                path,
                new Uint8Array(arrayBuffer),
            );
            return { bin: new Uint8Array(arrayBuffer), path };
        }
        return { bin: new Uint8Array(arrayBuffer) };
    }
}
