import { useState, useRef, useEffect, useCallback } from "react";
import { hooks as Web3Hooks } from "~/connectors/meta-mask";
import { useNetworkData } from "~/hooks/use-network-data";

interface Props {
  inMenu?: boolean;
  addresses: string[];
  walletIco: string;
  handlerDisconnect: () => void;
}

const WalletDropdown = (props: Props) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [textButton, setTextButton] = useState<string>("Copy Address");
  const dropdownRef = useRef<any>(null);
  const chainId = Web3Hooks.useChainId();
  const networkData = useNetworkData(chainId);

  function truncateAccount(account: string): string {
    return `${account.slice(0, 5)}...${account.slice(-4)}`;
  }

  useEffect(() => {
    const closeDropdown = (e: any) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("keydown", ({ key }) => {
      if (key === "Escape") {
        setIsOpen(false);
      }
    });
    window.addEventListener("click", closeDropdown);
  }, []);

  const handleCopy = useCallback((text: string) => {
    setTextButton("Copied");
    navigator.clipboard.writeText(text);
    setTimeout(() => {
      setTextButton("Copy Address");
    }, 1000);
  }, []);
  return (
    <div
      className={`relative z-40 xl:w-[auto] ${
        props.inMenu ? "!w-[auto]" : "h-[34px]"
      } ${isOpen ? "w-[34px]" : "w-[34px] xl:w-[auto]"} xl:h-[44px]`}
      ref={dropdownRef}
    >
      <button
        aria-label="Your Wallet"
        tabIndex={0}
        className={`dropdown__wallet__custom px-[10px] ${
          props.inMenu ? "dropdown__button-inMenu" : ""
        } relative flex bg-[#181D1B] hover:bg-[#262C2A] cursor-pointer rounded-[6px] flex items-center h-[34px] xl:h-[44px]`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <img
          aria-hidden={true}
          className={`w-[16px] h-[16px] ${
            props.inMenu ? "hidden" : "block xl:hidden"
          }`}
          src="/images/ico/wallet.svg"
          alt="..."
        />
        <div
          className={`${
            props.inMenu ? "block mr-[16px]" : "hidden xl:block"
          } mr-[9px]`}
        >
          <img
            aria-hidden={true}
            className="w-[16px]"
            src={props.walletIco}
            alt="..."
          />
        </div>
        <div
          className={`${
            props.inMenu ? "block" : "hidden xl:block"
          } text-sm font-semibold text-right leading-[14px] font-nova mr-[8px]`}
        >
          {truncateAccount(props.addresses[0])}
        </div>
        <svg
          className={`arrow__custom ${
            props.inMenu
              ? isOpen
                ? "rotate-180"
                : "rotate-0"
              : isOpen
              ? "rotate-0 hidden xl:flex"
              : "rotate-180 hidden xl:flex"
          }`}
          width="10"
          height="6"
          viewBox="0 0 10 6"
        >
          <path d="M5.00003 0.149816C5.17925 0.149816 5.35845 0.218246 5.49508 0.354819L9.79486 4.65464C10.0684 4.92816 10.0684 5.37163 9.79486 5.64504C9.52145 5.91845 9.07807 5.91845 8.80452 5.64504L5.00003 1.84032L1.19551 5.64491C0.921987 5.91832 0.478651 5.91832 0.205262 5.64491C-0.0683924 5.37149 -0.0683923 4.92803 0.205262 4.6545L4.50497 0.354686C4.64168 0.218091 4.82087 0.149816 5.00003 0.149816Z" />
        </svg>
      </button>

      <div
        className={`overflow-hidden w-[220px] xl:w-[219px] rounded-[6px] ${
          props.inMenu
            ? "bottom-[60px]"
            : "right-[0px] top-[calc(100%+5px)] xl:right-[0px] xl:top-[calc(100%+8px)]"
        } absolute ${
          isOpen ? "dropdown__body dropdown__body-active" : "dropdown__body"
        }`}
      >
        <div className="flex items-center py-[13px] px-[15px] xl:py-[15px] xl:px-[15px] border-b border-[#b5cfcc2b]">
          <div className="flex pt-[3px]">
            <img
              aria-hidden={true}
              className="w-[25px]"
              src={props.walletIco}
              alt="..."
            />
          </div>
          <p className="pl-[10px] text-base font-nova font-semibold text-right leading-[19.49px]">
            {truncateAccount(props.addresses[0])}
          </p>
        </div>
        <button
          tabIndex={0}
          aria-label="Copy address"
          onClick={() => handleCopy(props.addresses[0])}
          className="flex items-center justify-between p-[14px] hover:bg-[#2B302F] cursor-pointer w-full"
        >
          <div className="flex items-center">
            <img
              aria-hidden={true}
              className="w-[16px] h-[16px] mr-[15px]"
              src="/images/wallet-icons/wallet-copy.svg"
              alt="..."
            />
            <p className="font-nova text-sm font-normal text-white leading-[14px]">
              {textButton}
            </p>
          </div>
        </button>
        <a
          className="flex items-center p-[14px] hover:bg-[#2B302F] cursor-pointer"
          target="_blank"
          rel="noreferrer"
          href={networkData?.userExplorerUrl + props.addresses[0] || ""}
        >
          <img
            aria-hidden={true}
            className="w-[16px] h-[16px] mr-[15px]"
            src="/images/wallet-icons/balance-link.svg"
            alt="..."
          />
          <p className="font-nova text-sm font-normal text-white leading-[14px]">
            View Explorer
          </p>
        </a>
        <button
          onClick={() => props.handlerDisconnect()}
          className="flex items-center justify-between p-[14px] hover:bg-[#2B302F] cursor-pointer w-full"
        >
          <div className="flex items-center">
            <img
              aria-hidden={true}
              className="w-[16px] h-[16px] mr-[15px]"
              src="/images/wallet-icons/wallet-disconnect.svg"
              alt="..."
            />
            <p className="font-nova text-sm font-normal text-white leading-[14px]">
              Disconnect Wallet
            </p>
          </div>
        </button>
      </div>
    </div>
  );
};

export default WalletDropdown;
