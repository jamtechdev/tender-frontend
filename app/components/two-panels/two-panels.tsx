import { useContext, useState } from "react";
import type { Market } from "~/types/global";
import TooltipMobile from "./tooltip-mobile";

import TooltipMobileMulti from "./tooltip-mobile-MULTI";
import TwoPanelsEmpty from "./two-panels-empty";
import { TenderContext } from "~/contexts/tender-context";
import { formatApy } from "~/lib/apy-calculations";
import * as math from "mathjs";
import DisplayPrice from "~/components/shared/DisplayPrice";
import APY, {  getRewards } from "../shared/APY";
import { useTenderContext } from "~/hooks/use-tender-context";

type APY_CELL_PROPS = {
  token: Market;
  type: "supply" | "borrow";
  multiTooltipData: typeof initialTooltipState;
  setMultiTooltipData: any;
}


const initialTooltipState = {
  open: false,
  coins: [{}],
}

function APY_CELL({token, type, setMultiTooltipData, multiTooltipData}: APY_CELL_PROPS) {
  let context = useTenderContext()
  if (!context) return null
  let rewards = getRewards(context, type, token)

return <td className="p-0">
  <a
    className="flex items-center h-full  relative pb-[30px] text-white font-nova font-normal md:pt-[24px] md:pb-[39px] pl-[15px] pr-[15px] text-sm md:text-base"
    href={`/markets/${token.tokenPair.token.symbol}`}
    target="_blank"
    rel="noreferrer"
  >
    <div
      className={`custom__hidden ${checkColorClass(parseFloat(token.marketData.depositApy))} `}
    >
      {rewards.totalAPY}
    </div>
    <div
      tabIndex={0}
      className="group focus:outline-none"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="absolute top-[25px] md:top-[61px] left-[15px] h-[22px]">
        <div
          onClick={() => {
            let coins = [
              {
                coinTitle: token.tokenPair.token.symbol,
                iconSrc: token.tokenPair.token.icon,
                data: token.marketData.depositApy,
                color: checkColorClass(
                  parseFloat(
                    token.marketData.depositApy
                  )
                ),
              }
            ]

            if (type === "supply" && token.compSupplySpeeds ) {
              coins.push({
                coinTitle: "esTND",
                iconSrc:
                  "/images/wallet-icons/balance-icon.svg",
                data: rewards.incentive,
                color: "text-white",
              })
            } else if (type === "borrow" && token.compBorrowSpeeds ) {
              coins.push({
                coinTitle: "esTND",
                iconSrc:
                  "/images/wallet-icons/balance-icon.svg",
                data: rewards.incentive,
                color: "text-white",
              })
            }
            setMultiTooltipData({
              ...multiTooltipData,
              open: window.innerWidth < 1023,
              coins
            })
        }}
          className="!flex items-center break-words bg-[#181D1B] text-[#A3AEAC] rounded-md text-[11px] text-center h-[20px] px-[5px]"
        >
          <img
            aria-hidden={true}
            className="w-[13px] h-[13px]"
            src={token.tokenPair.token.icon}
            alt={token.tokenPair.token.symbol}
          />
          <img
            aria-hidden={true}
            className="w-[13px] h-[13px] ml-[6px]"
            src="/images/wallet-icons/balance-icon.svg"
            alt="..."
          />
        </div>
        <div className="hidden flex-col absolute bottom__custom items-center group-hover:hidden lg:group-hover:flex lg:group-focus:flex rounded-[10px]">
          <div className="relative z-10 leading-none whitespace-no-wrap shadow-lg w-[100%] mx-[0px] !rounded-[10px] panel-custom">
            <div className="flex-col w-full h-full bg-[#181D1B] shadow-lg rounded-[10px] pt-[14px] pr-[16px] pb-[14px] pl-[16px]">
              <APY market={token} type={type} />
            </div>
          </div>
          <div className="custom__arrow__tooltip relative top-[-6px] left-[0.5px] w-3 h-3 rotate-45 bg-[#181D1B]"></div>
        </div>
      </div>
    </div>
  </a>
</td>
}

export const checkColorClass = (value: number | string) => {
  const valueNumber = parseFloat(
    math.format(value, { notation: "fixed", precision: 2 })
  );
  switch (true) {
    case valueNumber > 0:
      return "text-dark-green";
    case valueNumber < 0:
      return "text-[#00E0FF]";
    default:
      return "text-white";
  }
};


export default function TwoPanels() {
  const tenderContextData = useContext(TenderContext);
  let [multiTooltipData, setMultiTooltipData] = useState(initialTooltipState);

  let [mobileTooltipData, setMobileTooltipData] = useState<{
    open: boolean;
    textTop: string;
    icon?: string;
    token?: string;
    textBottom?: string;
  }>({ open: false, textTop: "", token: "", icon: "", textBottom: "" });

  const marketsWithSupply = tenderContextData.markets.filter(
    (token: Market) => token.supplyBalance && token.supplyBalanceInUsd > 0
  );

  const marketsWithoutSupply = tenderContextData.markets.filter(
    (token: Market) => !token.supplyBalance || token.supplyBalanceInUsd <= 0
  );

  const marketsWithBorrow = tenderContextData.markets.filter(
    (token: Market) => token.borrowBalance && token.borrowBalanceInUsd > 0
  );

  const marketsWithoutBorrow = tenderContextData.markets
    .filter((token: Market) => token.tokenPair.token.symbol !== "GLP")
    .filter(
      (token: Market) => !token.borrowBalance || token.borrowBalanceInUsd <= 0
    );

    return tenderContextData.markets.length ? (
    <div className="flex flex-col xl:grid grid-cols-2 gap-[60px] xl:gap-[20px] mb-14">
      <TooltipMobile
        mobileTooltipData={mobileTooltipData}
        handleClose={() =>
          setMobileTooltipData({
            open: false,
            textTop: "",
            token: "",
            icon: "",
            textBottom: "",
          })
        }
      />

      <TooltipMobileMulti
        tooltipData={multiTooltipData}
        handleClose={() =>
          setMultiTooltipData({
            open: false,
            coins: [],
          })
        }
      />

      <div>
        {marketsWithSupply.length > 0 && (
          <div className="pb-[5px] panel-custom main border-custom mb-[20px] md:pb-[0px] md:mb-[40px]">
            <div
              tabIndex={0}
              className="px-[15px] textSize22 py-[17px] md:py-[20px] font-space font-bold text-lg border-b border-[#282C2B] md:px-[30px] md:pt-[18px] md:pb-[19px] md:text-xl"
            >
              Supply
            </div>
            <table className="custom__scroll w-full h-full table-fixed">
              <thead>
                <tr
                  className={`w-full text-xs text-[#818987] ${
                    marketsWithSupply.length && "border-b border-[#282C2B]"
                  }`}
                >
                  <th className="whitespace-nowrap font-nova font-[600] text-start text-xs w-[115px] min-w-[115px] sm:w-[165px] sm:min-w-[165px] md:text-sm pt-[15px] pb-[15px] md:pt-[18px] md:pb-[18px] pl-[15px] md:pl-[30px] pr-[15px]">
                    Asset
                  </th>
                  <th className="whitespace-nowrap font-nova font-[600] text-start text-xs w-[160px] min-w-[160px] sm:w-[160px] sm:min-w-[160px] md:text-sm pt-[15px] pb-[15px] md:pt-[18px] md:pb-[18px] pl-[15px] pr-[15px]">
                    Total Supply
                  </th>
                  <th className="whitespace-nowrap font-nova font-[600] text-start text-xs w-[110px] min-w-[110px] sm:w-[120px] sm:min-w-[120px] md:text-sm pt-[15px] pb-[15px] md:pt-[18px] md:pb-[18px] pl-[15px] pr-[15px]">
                    Supply APY
                  </th>
                  <th className="whitespace-nowrap font-nova font-[600] text-start text-xs w-[100%] min-w-[160px] sm:w-[160px] sm:min-w-[160px] md:text-sm pt-[15px] pb-[15px] md:pt-[18px] md:pb-[18px] pl-[15px] pr-[20px]">
                    Your Supply
                  </th>
                </tr>
              </thead>

              <tbody>
                {marketsWithSupply.map((token: Market) => {
                  return (
                    <tr
                      key={token.id}
                      tabIndex={0}
                      role="row"
                      className="p-0 h-[80px] md:h-auto text-gray-400 border-t border__top__custom cursor-pointer"
                      onKeyUp={(e) =>
                        e.key === "Enter" &&
                        window.open(
                          `/markets/${token.tokenPair.token.symbol}/`,
                          "_blank"
                        )
                      }
                    >
                      <td className="p-0">
                        <a
                          className="flex items-center h-full  relative items-center justify-left text-white font-nova font-normal pl-[14px] pb-[30px] md:pt-[24px] md:pb-[39px] pl-[15px] md:pl-[30px] pr-[15px]"
                          href={`/markets/${token.tokenPair.token.symbol}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <img
                            aria-hidden={true}
                            className="w-[24px] h-[24px] mr-[10px] md:mr-[16px] md:w-[40px] md:h-[40px]"
                            src={token.tokenPair.token.icon}
                            alt={token.tokenPair.token.symbol}
                          />
                          <span className="flex text-sm md:text-base">
                            {token.tokenPair.token.symbol}
                          </span>
                        </a>
                      </td>
                      <td className="p-0">
                        <a
                          className="relative flex items-center h-full  whitespace-nowrap md:whitespace-normal relative text-white font-nova font-normal pb-[30px] md:pt-[24px] md:pb-[39px] pl-[15px] pr-[15px] text-sm md:text-base"
                          href={`/markets/${token.tokenPair.token.symbol}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <div className="custom__hidden">
                            <DisplayPrice
                              amount={token.marketData.marketSize?.toString()}
                              tokenSymbol={token.tokenPair.token.symbol}
                            />
                          </div>
                          <div className="!flex items-center break-words bg-dark-green text-dark-green rounded-md text-[11px] md:text-xs text-center h-[20px] md:h-[22px] px-[5px] absolute top-[25px] md:top-[61px] left-[15px]">
                            <DisplayPrice
                              amount={token.marketData.marketSize?.toString()}
                              baseFactor={token.tokenPair.token.priceInUsd.toString()}
                              isCompact
                            />
                          </div>
                        </a>
                      </td>
                      <APY_CELL type={"supply"} token={token} setMultiTooltipData={setMultiTooltipData} multiTooltipData={multiTooltipData} />
                      <td className="p-0">
                        <a
                          className="flex items-center h-full relative text-white font-nova font-normal pb-[30px] md:pt-[24px] md:pb-[39px] pl-[15px] pr-[20px text-sm md:text-base]"
                          href={`/markets/${token.tokenPair.token.symbol}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <div className="custom__hidden">
                            <DisplayPrice
                              amount={token.supplyBalance.toString()}
                              tokenSymbol={token.tokenPair.token.symbol}
                            />
                          </div>
                          <div className="!flex items-center break-words bg-dark-green text-dark-green rounded-md text-[11px] md:text-xs text-center h-[20px] md:h-[22px] px-[5px] absolute top-[25px] md:top-[61px] left-[15px]">
                            <DisplayPrice
                              amount={token.supplyBalanceInUsd.toString()}
                              baseFactor="1" // amount is already in usd
                              isCompact
                            />
                          </div>
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {marketsWithoutSupply.length > 0 && (
          <div className="focus:outline-none pb-[5px] panel-custom main border-custom md:pb-[0px]">
            <div
              tabIndex={0}
              className="px-[15px] textSize22 py-[17px] md:py-[20px] font-space font-bold text-lg border-b border-[#282C2B] md:px-[30px] md:pt-[18px] md:pb-[19px] md:text-xl"
            >
              Supply Markets
            </div>
            <table
              role="grid"
              className="custom__scroll w-full h-full table-fixed"
            >
              <thead>
                <tr className="w-full text-xs text-[#818987] border-b border-[#282C2B]">
                  <th className="whitespace-nowrap font-nova font-[600] text-start text-xs w-[115px] min-w-[115px] sm:w-[165px] sm:min-w-[165px] md:text-sm pt-[15px] pb-[15px] md:pt-[18px] md:pb-[18px] pl-[15px] md:pl-[30px] pr-[15px]">
                    Asset
                  </th>
                  <th className="whitespace-nowrap font-nova font-[600] text-start text-xs w-[160px] min-w-[160px] sm:w-[160px] sm:min-w-[160px] md:text-sm pt-[15px] pb-[15px] md:pt-[18px] md:pb-[18px] pl-[15px] pr-[15px]">
                    Total Supply
                  </th>
                  <th className="whitespace-nowrap font-nova font-[600] text-start text-xs w-[110px] min-w-[110px] sm:w-[120px] sm:min-w-[120px] md:text-sm pt-[15px] pb-[15px] md:pt-[18px] md:pb-[18px] pl-[15px] pr-[15px]">
                    Supply APY
                  </th>
                  <th className="whitespace-nowrap font-nova font-[600] text-start text-xs w-[100%] min-w-[160px] sm:w-[160px] sm:min-w-[160px] md:text-sm pt-[15px] pb-[15px] md:pt-[18px] md:pb-[18px] pl-[15px] pr-[20px]">
                    Wallet Balance
                  </th>
                </tr>
              </thead>

              <tbody>
                {marketsWithoutSupply.map((token: Market) => {
                  return (
                    <tr
                      key={token.id}
                      tabIndex={0}
                      role="row"
                      className="p-0 h-[80px] md:h-auto text-gray-400 border-t border__top__custom cursor-pointer"
                      onKeyUp={(e) =>
                        e.key === "Enter" &&
                        window.open(
                          `/markets/${token.tokenPair.token.symbol}/`,
                          "_blank"
                        )
                      }
                    >
                      <td className="p-0">
                        <a
                          className="relative flex items-center h-full  text-white font-nova font-normal pl-[14px] pb-[30px] md:pt-[24px] md:pb-[39px] pl-[15px] md:pl-[30px] pr-[15px]"
                          href={`/markets/${token.tokenPair.token.symbol}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <div className="flex items-center justify-left">
                            <img
                              aria-hidden={true}
                              className="w-[24px] h-[24px] mr-[10px] md:mr-[16px] md:w-[40px] md:h-[40px]"
                              src={token.tokenPair.token.icon}
                              alt={token.tokenPair.token.symbol}
                            />
                            <span className="flex text-sm md:text-base">
                              {token.tokenPair.token.symbol}
                            </span>
                          </div>
                        </a>
                      </td>
                      <td className="p-0">
                        <a
                          className="flex items-center h-full relative whitespace-nowrap md:whitespace-normal relative text-white font-nova font-normal pb-[30px] md:pt-[24px] md:pb-[39px] pl-[15px] pr-[15px] text-sm md:text-base"
                          href={`/markets/${token.tokenPair.token.symbol}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <div className="custom__hidden">
                            <DisplayPrice
                              amount={token.marketData.marketSize?.toString()}
                              tokenSymbol={token.tokenPair.token.symbol}
                            />
                          </div>
                          <div className="!flex items-center break-words bg-dark-green text-dark-green rounded-md text-[11px] md:text-xs text-center h-[20px] md:h-[22px] px-[5px] absolute top-[25px] md:top-[61px] left-[15px]">
                            <DisplayPrice
                              amount={token.marketData.marketSize?.toString()}
                              baseFactor={token.tokenPair.token.priceInUsd.toString()}
                              isCompact
                            />
                          </div>
                        </a>
                      </td>
                      <APY_CELL type={"supply"} token={token} setMultiTooltipData={setMultiTooltipData} multiTooltipData={multiTooltipData} />
                      <td className="p-0">
                        <a
                          className="flex items-center h-full relative text-white font-nova font-normal pb-[30px] md:pt-[24px] md:pb-[39px] pl-[15px] pr-[20px text-sm md:text-base]"
                          href={`/markets/${token.tokenPair.token.symbol}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <div className="custom__hidden">
                            <DisplayPrice
                              amount={token.walletBalance}
                              tokenSymbol={token.tokenPair.token.symbol}
                              decimals={token.tokenPair.token.decimals}
                            />
                          </div>
                          <div className="!flex items-center break-words bg-dark-green text-dark-green rounded-md text-[11px] md:text-xs text-center h-[20px] md:h-[22px] px-[5px] absolute top-[25px] md:top-[61px] left-[15px]">
                            <DisplayPrice
                              amount={token.walletBalance}
                              decimals={token.tokenPair.token.decimals}
                              baseFactor={token.tokenPair.token.priceInUsd.toString()}
                              isCompact
                            />
                          </div>
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <div>
        {marketsWithBorrow.length > 0 && (
          <div className="pb-[5px] md:pb-[0px] panel-custom main border-custom mb-[20px] md:mb-[40px]">
            <div
              tabIndex={0}
              className="px-[15px] textSize22 py-[17px] md:py-[20px] font-space font-bold text-lg border-b border-[#282C2B] md:px-[30px] md:pt-[18px] md:pb-[19px] md:text-xl"
            >
              Borrow
            </div>
            <table className="custom__scroll w-full h-full table-fixed">
              <thead>
                <tr
                  className={`w-full text-xs text-[#818987] ${
                    marketsWithBorrow.length && "border-b border-[#282C2B]"
                  }`}
                >
                  <th className="whitespace-nowrap font-nova font-[600] text-start text-xs w-[115px] min-w-[115px] sm:w-[165px] sm:min-w-[165px] md:text-sm pt-[15px] pb-[15px] md:pt-[18px] md:pb-[18px] pl-[15px] md:pl-[30px] pr-[15px]">
                    Asset
                  </th>
                  <th className="whitespace-nowrap font-nova font-[600] text-start text-xs w-[160px] min-w-[160px] sm:w-[160px] sm:min-w-[160px] md:text-sm pt-[15px] pb-[15px] md:pt-[18px] md:pb-[18px] pl-[15px] pr-[15px]">
                    Total Borrow
                  </th>
                  <th className="whitespace-nowrap font-nova font-[600] text-start text-xs w-[110px] min-w-[110px] sm:w-[120px] sm:min-w-[120px] md:text-sm pt-[15px] pb-[15px] md:pt-[18px] md:pb-[18px] pl-[15px] pr-[15px]">
                    Borrow APY
                  </th>
                  <th className="whitespace-nowrap font-nova font-[600] text-start text-xs w-[100%] min-w-[160px] sm:w-[160px] sm:min-w-[160px] md:text-sm pt-[15px] pb-[15px] md:pt-[18px] md:pb-[18px] pl-[15px] pr-[20px]">
                    Your Borrow
                  </th>
                </tr>
              </thead>

              <tbody>
                {marketsWithBorrow.map((token: Market) => {
                  const borrowApy = parseFloat(token.marketData.borrowApy) * -1;
                  const borrowApyFormatted = formatApy(borrowApy);

                  return (
                    <tr
                      key={token.id}
                      tabIndex={0}
                      role="row"
                      className="p-0 h-[80px] md:h-auto text-gray-400 border-t border__top__custom cursor-pointer"
                      onKeyUp={(e) =>
                        e.key === "Enter" &&
                        window.open(
                          `/markets/${token.tokenPair.token.symbol}/`,
                          "_blank"
                        )
                      }
                    >
                      <td className="p-0">
                        <a
                          className="flex items-center h-full relative text-white font-nova font-normal pl-[14px] pb-[30px] md:pt-[24px] md:pb-[39px] pl-[15px] md:pl-[30px] pr-[15px]"
                          href={`/markets/${token.tokenPair.token.symbol}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <div className="flex items-center justify-left">
                            <img
                              aria-hidden={true}
                              className="w-[24px] h-[24px] mr-[10px] md:mr-[16px] md:w-[40px] md:h-[40px]"
                              src={token.tokenPair.token.icon}
                              alt={token.tokenPair.token.symbol}
                            />
                            <span className="flex text-sm md:text-base">
                              {token.tokenPair.token.symbol}
                            </span>
                          </div>
                        </a>
                      </td>
                      <td className="p-0">
                        <a
                          className="flex items-center h-full whitespace-nowrap md:whitespace-normal relative text-white font-nova font-normal pb-[30px] md:pt-[24px] md:pb-[39px] pl-[15px] pr-[15px] text-sm md:text-base"
                          href={`/markets/${token.tokenPair.token.symbol}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <div className="custom__hidden">
                            <DisplayPrice
                              amount={token.marketData?.totalBorrowed?.toString()}
                              tokenSymbol={token.tokenPair.token.symbol}
                            />
                          </div>
                          <div className="!flex items-center break-words bg-dark-green text-dark-green rounded-md text-[11px] md:text-xs text-center h-[20px] md:h-[22px] px-[5px] absolute top-[25px] md:top-[61px] left-[15px]">
                            <DisplayPrice
                              amount={token.marketData?.totalBorrowed?.toString()}
                              baseFactor={token.tokenPair.token.priceInUsd.toString()}
                              isCompact
                            />
                          </div>
                        </a>
                      </td>
                      <APY_CELL type={"supply"} token={token} setMultiTooltipData={setMultiTooltipData} multiTooltipData={multiTooltipData} />

                      <td className="p-0">
                        <a
                          className="flex items-center h-full relative text-white font-nova font-normal pb-[30px] md:pt-[24px] md:pb-[39px] pl-[15px] pr-[20px text-sm md:text-base]"
                          href={`/markets/${token.tokenPair.token.symbol}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <div className="custom__hidden">
                            <DisplayPrice
                              amount={token.borrowBalance.toString()}
                              tokenSymbol={token.tokenPair.token.symbol}
                            />
                          </div>
                          <div className="!flex items-center break-words bg-dark-green text-dark-green rounded-md text-[11px] md:text-xs text-center h-[20px] md:h-[22px] px-[5px] absolute top-[25px] md:top-[61px] left-[15px]">
                            <DisplayPrice
                              amount={token.borrowBalanceInUsd.toString()}
                              baseFactor="1"
                              isCompact
                            />
                          </div>
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {marketsWithoutBorrow.length > 0 && (
          <div className="focus:outline-none pb-[5px] panel-custom main border-custom md:pb-[0px]">
            <div
              tabIndex={0}
              className="px-[15px] textSize22 py-[17px] md:py-[20px] font-space font-bold text-lg border-b border-[#282C2B] md:px-[30px] md:pt-[18px] md:pb-[19px] md:text-xl"
            >
              Borrow Markets
            </div>
            <table className="custom__scroll w-full h-full table-fixed !pb-[23px] md:pb-[0px] md:pt-[0px]">
              <thead>
                <tr className="w-full text-xs text-[#818987] border-b border-[#282C2B]">
                  <th className="whitespace-nowrap font-nova font-[600] text-start text-xs w-[115px] min-w-[115px] sm:w-[165px] sm:min-w-[165px] md:text-sm pt-[15px] pb-[15px] md:pt-[18px] md:pb-[18px] pl-[15px] md:pl-[30px] pr-[15px]">
                    Asset
                  </th>
                  <th className="whitespace-nowrap font-nova font-[600] text-start text-xs w-[160px] min-w-[160px] sm:w-[160px] sm:min-w-[160px] md:text-sm pt-[15px] pb-[15px] md:pt-[18px] md:pb-[18px] pl-[15px] pr-[15px]">
                    Total Borrow
                  </th>
                  <th className="whitespace-nowrap font-nova font-[600] text-start text-xs w-[110px] min-w-[110px] sm:w-[120px] sm:min-w-[120px] md:text-sm pt-[15px] pb-[15px] md:pt-[18px] md:pb-[18px] pl-[15px] pr-[15px]">
                    Borrow APY
                  </th>
                  <th className="whitespace-nowrap font-nova font-[600] text-start text-xs w-[100%] min-w-[160px] sm:w-[160px] sm:min-w-[160px] md:text-sm pt-[15px] pb-[15px] md:pt-[18px] md:pb-[18px] pl-[15px] pr-[20px]">
                    Available Borrow
                  </th>
                </tr>
              </thead>

              <tbody>
                {marketsWithoutBorrow.map((token: Market) => {
                  const borrowApy = parseFloat(token.marketData.borrowApy) * -1;
                  const borrowApyFormatted = formatApy(borrowApy);

                  return (
                    <tr
                      key={token.id}
                      tabIndex={0}
                      role="row"
                      className="p-0 h-[80px] md:h-auto text-gray-400 border-t border__top__custom cursor-pointer"
                      onKeyUp={(e) =>
                        e.key === "Enter" &&
                        window.open(
                          `/markets/${token.tokenPair.token.symbol}/`,
                          "_blank"
                        )
                      }
                    >
                      <td className="p-0">
                        <a
                          className="flex items-center h-full relative text-white font-nova font-normal pl-[14px] pb-[30px] md:pt-[24px] md:pb-[39px] pl-[15px] md:pl-[30px] pr-[15px]"
                          href={`/markets/${token.tokenPair.token.symbol}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <div className="flex items-center justify-left">
                            <img
                              aria-hidden={true}
                              className="w-[24px] h-[24px] mr-[10px] md:mr-[16px] md:w-[40px] md:h-[40px]"
                              src={token.tokenPair.token.icon}
                              alt={token.tokenPair.token.symbol}
                            />
                            <span className="flex text-sm md:text-base">
                              {token.tokenPair.token.symbol}
                            </span>
                          </div>
                        </a>
                      </td>
                      <td className="p-0">
                        <a
                          className="flex items-center h-full whitespace-nowrap md:whitespace-normal relative text-white font-nova font-normal pb-[30px] md:pt-[24px] md:pb-[39px] pl-[15px] pr-[15px] text-sm md:text-base"
                          href={`/markets/${token.tokenPair.token.symbol}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <div className="custom__hidden">
                            <DisplayPrice
                              amount={token.marketData?.totalBorrowed?.toString()}
                              tokenSymbol={token.tokenPair.token.symbol}
                            />
                          </div>
                          <div className="!flex items-center break-words bg-dark-green text-dark-green rounded-md text-[11px] md:text-xs text-center h-[20px] md:h-[22px] px-[5px] absolute top-[25px] md:top-[61px] left-[15px]">
                            <DisplayPrice
                              amount={token.marketData?.totalBorrowed?.toString()}
                              baseFactor={token.tokenPair.token.priceInUsd.toString()}
                              isCompact
                            />
                          </div>
                        </a>
                      </td>
                      <APY_CELL type={"supply"} token={token} setMultiTooltipData={setMultiTooltipData} multiTooltipData={multiTooltipData} />
                      <td className="p-0">
                        <a
                          className="flex items-center h-full relative text-white font-nova font-normal pb-[30px] md:pt-[24px] md:pb-[39px] pl-[15px] pr-[20px text-sm md:text-base]"
                          href={`/markets/${token.tokenPair.token.symbol}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <div className="custom__hidden">
                            <DisplayPrice
                              amount={token.maxBorrowLiquidity.toString()}
                              tokenSymbol={token.tokenPair.token.symbol}
                            />
                          </div>
                          <div className="!flex items-center break-words bg-dark-green text-dark-green rounded-md text-[11px] md:text-xs text-center h-[20px] md:h-[22px] px-[5px] absolute top-[25px] md:top-[61px] left-[15px]">
                            <DisplayPrice
                              amount={token.maxBorrowLiquidity.toString()}
                              baseFactor={token.tokenPair.token.priceInUsd.toString()}
                              isCompact
                            />
                          </div>
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  ) : (
    <TwoPanelsEmpty loading={true} />
  );
}
