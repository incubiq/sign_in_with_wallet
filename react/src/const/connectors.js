
  const CONNECTOR_SIWW = "SIWW"

  const CONNECTOR_SIWC = "SIWC"
  const CONNECTOR_SIWM = "SIWM"
  
  const getDefault = () => {
    return {
      symbol: CONNECTOR_SIWW,           // for internal use
      blockchain: "SignWithWallet.com",     // target display name
      window: null,                     // the window element to explore
      logo: "/assets/images/symbol_siww.png"
    }
  }

  const getConnectors = () => {
    let objRet = {
      aConnector:  [CONNECTOR_SIWC, CONNECTOR_SIWM],
    }

    objRet[CONNECTOR_SIWC] = {
      symbol: CONNECTOR_SIWC,           // for internal use
      blockchain: "Cardano",            // target display name
      window: "cardano",                // the window element to explore
      logo: "/assets/images/symbol_cardano.png"
    }

    objRet[CONNECTOR_SIWM] = {
      symbol: CONNECTOR_SIWM,            // for internal use
      blockchain: "Metamask",            // target display name
      window: "ethereum",                // the window element to explore
      logo: "/assets/images/symbol_ethereum.png"
    }

    return objRet;
  }

export {
  CONNECTOR_SIWC,
  CONNECTOR_SIWM,
  getConnectors,
  getDefault
};
