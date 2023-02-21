import { LoaderFunction, json } from "cloudflare/deno";
import { Tendies } from "~/config/networks/arbitrum";

let contract = Tendies.Tokens.TND.address

export const loader:LoaderFunction = async ({ request }) => {
    // let response = await fetch(`https://api.coingecko.com/api/v3/simple/token_price/arbitrum-one?contract_addresses=${contract}&vs_currencies=usd`)
    let js = {"usd": 3.5} // await response.json() as {[contract: string]: {"usd": number}}
    
    return json(js, {
        headers: {
            "Cache-Control": "max-age=45, public",
        },
    });
};
