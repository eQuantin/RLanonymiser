import command from "./Commands/default.ts";

/*  TODOS
 *  -> Create a replay cache to avoid ballchasing rate limits and to avoid anonymising the same replay multiple times
 *  -> Change logger
 *  -> Parse replay header to provide basic informations, this class could be the bridge with anonymising functions
 */

try {
    await command();
} catch (err) {
    console.error(err);
    Deno.exit(1);
}
Deno.exit(0);
