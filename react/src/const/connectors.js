
  const CONNECTOR_SIWW = "SIWW"

  const CONNECTOR_SIWC = "SIWC"
  const CONNECTOR_SIWM = "SIWM"
  const CONNECTOR_SIWK = "SIWK"
  const CONNECTOR_SIWP = "SIWP"

  const getDefault = () => {
    return {
      symbol: CONNECTOR_SIWW,           // for internal use
      wallet_name: "Wallet",         // target display name
      wallet_logo: "/assets/images/symbol_siww_full.png",
      blockchain_name: "SignWithWallet.com",
      window: null,                     // the window element to explore
    }
  }

  // todo : remove those calls to connectors here...
  
  const getConnectors = () => {
    let objRet = {
      aConnector:  [CONNECTOR_SIWC, CONNECTOR_SIWM, CONNECTOR_SIWK, CONNECTOR_SIWP],
    }

    objRet[CONNECTOR_SIWC] = {
      symbol: CONNECTOR_SIWC,           // for internal use
      connector_name: "Cardano",        // name of this connector
      aAcceptedBlockchain: [],          // will be filled from Connector itself
      wallet_name: "Cardano wallets",   // target display name
      wallet_logo: "/assets/images/symbol_cardano.png",
      blockchain_name: "Cardano",       // blockchain name  (can be changed by connector)
      window: "cardano",                // the window element to explore
    }

    objRet[CONNECTOR_SIWM] = {
      symbol: CONNECTOR_SIWM,            // for internal use
      connector_name: "Metamask",        // name of this connector
      aAcceptedBlockchain: [],           // will be filled from Connector itself
      wallet_name: "Metamask",           // target display name
      wallet_logo: "/assets/images/metamask.png",
      blockchain_name: "Metamask",       // blockchain name  (can be changed by connector)
      window: "ethereum",                // the window element to explore
    }

    objRet[CONNECTOR_SIWK] = {
      symbol: CONNECTOR_SIWK,            // for internal use
      connector_name: "Keplr",           // name of this connector
      aAcceptedBlockchain: [],           // will be filled from Connector itself
      wallet_name: "Keplr",              // target display name
      wallet_logo: "/assets/images/keplr.png",
      blockchain_name: "Keplr",          // blockchain name  (can be changed by connector)
      window: "keplr",                   // the window element to explore
    }
/*
    objRet[CONNECTOR_SIWP] = {
      symbol: CONNECTOR_SIWP,            // for internal use
      connector_name: "Phantom",         // name of this connector
      aAcceptedBlockchain: [],           // will be filled from Connector itself
      wallet_name: "Phantom",            // target display name
      wallet_logo: "/assets/images/phantom.png",
      blockchain_name: "Phantom",        // blockchain name  (can be changed by connector)
      window: "phantom",                 // the window element to explore
    }
*/
    return objRet;
  }

export {
  CONNECTOR_SIWC,
  CONNECTOR_SIWM,
  CONNECTOR_SIWK,
//  CONNECTOR_SIWP,
  getConnectors,
  getDefault
};
