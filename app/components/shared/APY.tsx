import { useMemo } from "react"
import { formatUnits } from "@ethersproject/units";
import { useTenderContext } from "~/hooks/use-tender-context";
import { formatApy } from "~/lib/apy-calculations";
import { TND_DECIMALS } from "~/lib/tnd";
import { Market, TenderContext } from "~/types/global"
import { checkColorClass } from "../two-panels/two-panels"

type APY_PROPS = {
    market?: Market,
    type: "borrow" | "supply"
}

function getBlocksPerYear(secondsPerBlock: number) {
    const SECONDS_PER_YEAR = 365 * 24 * 60 * 60;
    return Math.round(
      SECONDS_PER_YEAR / secondsPerBlock
    );    
}

export default function APY({market, type}: APY_PROPS) {
    let context = useTenderContext()
    if (!context || !market) return null

    var { apy, incentive } = getRewards(context, type, market);

    return <>
    <div className="flex justify-between gap-[30px] mb-[12px] last:mb-[0]">
    <div className="flex gap-[8px]">
      <img
        aria-hidden={true}
        className="max-w-[18px]"
        src={market.tokenPair.token.icon}
        alt={market.tokenPair.token.symbol}
      />
      <span className="font-nova text-white text-sm font-normal">
        {market.tokenPair.token.symbol}
      </span>
    </div>
    <span
      className={`font-nova text-white text-sm font-normal ${checkColorClass(
        apy
      )}`}
    >
    {type === "borrow" ? "-" : null}
      {apy}
    </span>
  </div>
  <ESTNDAPR incentive={incentive} />
  </>
}

export function getRewards(context: TenderContext, type: APY_PROPS["type"], market: Market) {
    let tndPrice = context.tndPrice;
    
    let seeds = type === "borrow" ? market.compBorrowSpeeds : market.compSupplySpeeds;
    let apyString = type === "borrow" ? market.marketData.borrowApy : market.marketData.depositApy;
    let apyNumber = parseFloat(apyString)
    var esTNDAPYNumber = 0


    if (tndPrice && seeds && market.marketData.marketSize) {
        let compSpeeds = parseFloat(formatUnits(seeds, TND_DECIMALS))
        let esTNDPerYear =compSpeeds * getBlocksPerYear(context.networkData.secondsPerBlock)
        esTNDAPYNumber = 100 * esTNDPerYear * tndPrice / market.marketData.marketSize
    }

    return {
        incentive: formatApy(esTNDAPYNumber),
        apy: formatApy(apyNumber),
        totalAPY: formatApy(apyNumber + esTNDAPYNumber)
    };
}

export function ESTNDAPR({ incentive }: {incentive?: string}) {
    return  <div className="flex justify-between gap-[30px]">
      <div className="flex gap-[8px]">
        <img
          className="max-w-[18px]"
          src="/images/wallet-icons/balance-icon.svg"
          alt="..."
        />
        <span className="font-nova text-white text-sm font-normal">
          esTND
        </span>
      </div>
      <span className="font-nova text-white text-sm font-normal whitespace-nowrap">
        {incentive}
      </span>
    </div>
  
  }