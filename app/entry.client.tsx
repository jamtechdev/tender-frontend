import { hydrate } from "react-dom";
import { RemixBrowser } from "remix";

import { Web3ReactProvider } from "@web3-react/core";
import { connectors } from "~/connectors/meta-mask";

hydrate(
  <Web3ReactProvider connectors={connectors}>
    <RemixBrowser />
  </Web3ReactProvider>,
  document
);
