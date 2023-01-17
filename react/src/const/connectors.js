
  const CONNECTOR_SIWC = "SIWC"
  const CONNECTOR_SIWM = "SIWM"
  
  const getConnectors = () => {
    let objRet = {
      aConnector:  [CONNECTOR_SIWC, CONNECTOR_SIWM],
    }

    objRet[CONNECTOR_SIWC] = {
      mnemonic: CONNECTOR_SIWC,       // for internal use
      display: "Sign-in with Cardano",  // Sign-in with ... display name
      target: "Cardano",              // target display name
      window: "cardano"               // the window element to explore
    }

    objRet[CONNECTOR_SIWM] = {
      mnemonic: CONNECTOR_SIWM,       // for internal use
      display: "Sign-in with Metamask",  // Sign-in with ... display name
      target: "Metamask",              // target display name
      window: "ethereum"               // the window element to explore
    }

    return objRet;
  }

export {
  CONNECTOR_SIWC,
  CONNECTOR_SIWM,
  getConnectors,
};
