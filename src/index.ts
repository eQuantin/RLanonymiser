import main from "./main.ts";

/*  TODOS
 *  -> Create a replay cache to avoid ballchasing rate limits and to avoid anonymising the same replay multiple times
 *  -> Change logger
 *  -> Parse replay header to provide basic informations, this class could be the bridge with anonymising functions
 */

try {
    // const ballchasingId = options.input!.split("/")[4];
    // await main(ballchasingId, ballchasingToken, options.debug);
} catch (err) {
    console.error(err);
    Deno.exit(1);
}
Deno.exit(0);
