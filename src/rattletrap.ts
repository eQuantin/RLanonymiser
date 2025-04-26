import { UntarStream } from "jsr:@std/tar";
import { dirname, normalize } from "jsr:@std/path";
import * as JSON from "npm:ts-typed-json";

export class Rattletrap {
    protected os = () => {
        switch (Deno.build.os) {
            case "windows":
                return "win32";
            case "darwin":
                return "darwin";
            case "linux":
                return "linux";
            default:
                return undefined;
        }
    };
    protected arch = Deno.build.arch == "x86_64" ? "x64" : "arm64";
    version = "14.1.1";
    path = Deno.cwd() + "/rattletrap.exe";

    constructor(private workdir: string, private debug: boolean = false) {}

    osCompatibility(): boolean {
        if (
            this.arch == "arm64" &&
            (this.os() == "linux" || this.os() == "win32")
        ) {
            return false;
        }
        return true;
    }

    async checkRattletrapInstall(): Promise<boolean> {
        try {
            console.debug("Checking existence of rattletrap.exe file");
            await Deno.lstat(this.path);
            console.debug("rattletrap.exe exist");
            return true;
        } catch (err) {
            if (!(err instanceof Deno.errors.NotFound)) {
                console.error("Unsupported error", err);
                throw err;
            }
            console.debug("rattletrap.exe not found");
            return false;
        }
    }

    async checkRattletrapVersion(): Promise<string | null> {
        // Check if Rattletrap file exist
        const exists = await this.checkRattletrapInstall();

        if (!exists) return null;

        // Check Rattletrap version
        console.debug("Checking Rattletrap version");
        const command = new Deno.Command(this.path, {
            args: ["-v"],
        });

        const { code, stdout, stderr } = await command.output();
        if (code === 0) {
            const version = new TextDecoder().decode(stdout).replace(
                /(\r\n|\n|\r)/gm,
                "",
            );
            console.debug(`Found version ${version}`);
            return version;
        } else {
            console.error(
                "An error occured while checking Rattletrap version",
                stderr,
            );
            throw new Error();
        }
    }

    async downloadRattletrap(): Promise<void> {
        console.debug("Check os compatibility with Rattletrap");
        if (!this.osCompatibility()) {
            console.error("Incompatible system", {
                os: Deno.build.os,
                arch: Deno.build.arch,
            });
            throw new Error();
        }

        const tarGzFilePath = "out.tar.gz";
        const url =
            `https://github.com/tfausak/rattletrap/releases/download/${this.version}/rattletrap-${this.version}-${this.os()}-${this.arch}.tar.gz`;

        console.debug("Rattletrap download url", url);

        // Download Rattletrap
        const file = await Deno.open(tarGzFilePath, {
            write: true,
            create: true,
        });
        try {
            console.debug("Fetching Rattletrap file");
            const response = await fetch(url);

            if (response.body) {
                const reader = response.body.getReader();
                const writer = file.writable.getWriter();

                if (response.status != 200) {
                    console.error(
                        "Request failed with status " + response.status,
                    );
                    throw new Error();
                } else {
                    console.info("Downloading Rattletrap ...");
                    try {
                        while (true) {
                            const { done, value } = await reader.read();
                            if (done) break;
                            await writer.write(value);
                        }
                    } catch (err) {
                        console.error(err);
                    } finally {
                        await writer.close();
                        console.info("Download completed");
                    }
                }
            }
        } catch {
            file.close();
        }

        // Decompress tar.gz archive
        console.info("Decompressing Rattletrap archive");
        for await (
            const entry of (await Deno.open(tarGzFilePath))
                .readable
                .pipeThrough(new DecompressionStream("gzip"))
                .pipeThrough(new UntarStream())
        ) {
            const path = normalize(entry.path);
            await Deno.mkdir(dirname(path), { recursive: true });
            await entry.readable?.pipeTo((await Deno.create(path)).writable);
        }

        //Remove compressed archive
        await Deno.remove(tarGzFilePath);

        console.info("Archive decompression completed");
    }

    async decode(replayBin: Uint8Array): Promise<JSON.Value> {
        console.debug("Decoding replay binaries");
        const command = new Deno.Command(this.path, {
            args: ["-c", "-m", "decode"],
            stdin: "piped",
            stdout: "piped",
            stderr: "piped",
        });

        const child = command.spawn();
        const writer = child.stdin.getWriter();
        await writer.write(replayBin);
        writer.releaseLock();
        await child.stdin.close();

        const { code, stdout, stderr } = await child.output();
        if (code === 0) {
            const json = JSON.parse(new TextDecoder().decode(stdout));
            if (this.debug) {
                console.debug("Writting raw json replay to file");
                await Deno.writeFile(
                    `${this.workdir}/raw.json`,
                    new TextEncoder().encode(JSON.stringify(json)),
                );
                console.debug("Done writting raw json replay to file");
            }
            return json;
        } else {
            throw new TextDecoder().decode(stderr);
        }
    }

    async encode(json: JSON.Object, replayPath: string): Promise<void> {
        const buffer = new TextEncoder().encode(JSON.stringify(json));

        const command = new Deno.Command(this.path, {
            args: ["-m", "encode", "-o", replayPath],
            stdin: "piped",
            stdout: "piped",
            stderr: "piped",
        });

        const child = command.spawn();
        const writer = child.stdin.getWriter();
        await writer.write(buffer);
        writer.releaseLock();
        await child.stdin.close();

        const { code, stdout, stderr } = await child.output();
        if (code === 0) {
            if (this.debug) {
                console.debug("Writting modified json replay to file");
                await Deno.writeFile(
                    `${this.workdir}/modified.json`,
                    buffer,
                );
                console.debug("Done writting modified json replay to file");
            }
        } else {
            throw new TextDecoder().decode(stderr);
        }
    }
}
