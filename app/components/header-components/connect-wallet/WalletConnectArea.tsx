import ConnectWallet from "./connect-wallet";
import NetworksDropdown from "./networksDropdown";

export const WalletConnectArea = () => {
  return (
    <>
      <NetworksDropdown />
      <ConnectWallet />
    </>
  );
};
