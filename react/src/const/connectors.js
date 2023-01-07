
  const CONNECTOR_SIWC = "SIWC"
  
  const getConnectors = () => {
    let objRet = {
      aConnector:  [CONNECTOR_SIWC],
    }

    objRet[CONNECTOR_SIWC] = {
      mnemonic: CONNECTOR_SIWC,       // for internal use
      display: "Sign-in with Cardano",  // Sign-in with ... display name
      target: "Cardano",              // target display name
      window: "cardano"               // the window element to explore
    }

    return objRet;
  }

export {
  CONNECTOR_SIWC,
  getConnectors,
};
