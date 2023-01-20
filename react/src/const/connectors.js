
  const CONNECTOR_SIWW = "SIWW"

  const CONNECTOR_SIWC = "SIWC"
  const CONNECTOR_SIWM = "SIWM"
  
  const getDefault = () => {
    return {
      symbol: CONNECTOR_SIWW,           // for internal use
      wallet_name: "Wallet",         // target display name
      wallet_logo: "/assets/images/symbol_siww_full.png",
      blockchain_name: "SignWithWallet.com",
      window: null,                     // the window element to explore
    }
  }

  const getConnectors = () => {
    let objRet = {
      aConnector:  [CONNECTOR_SIWC, CONNECTOR_SIWM],
    }

    objRet[CONNECTOR_SIWC] = {
      symbol: CONNECTOR_SIWC,           // for internal use
      aAcceptedBlockchain: [],          // will be filled from Connector itself
      wallet_name: "Cardano wallets",   // target display name
      blockchain_name: "Cardano",       // blockchain name  (can be changed by connector)
      window: "cardano",                // the window element to explore
    }

    objRet[CONNECTOR_SIWM] = {
      symbol: CONNECTOR_SIWM,            // for internal use
      aAcceptedBlockchain: [],           // will be filled from Connector itself
      wallet_name: "Metamask",           // target display name
      blockchain_name: "Metamask",       // blockchain name  (can be changed by connector)
      window: "ethereum",                // the window element to explore
    }

    return objRet;
  }

export {
  CONNECTOR_SIWC,
  CONNECTOR_SIWM,
  getConnectors,
  getDefault
};
