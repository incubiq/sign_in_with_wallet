
const getConnectorDisplayName = (_connector) => {
  switch(_connector) {
    case "siwc": 
    case "SIWC": 
      return "Sign-in with Cardano";

    default:
      return null;
  }
}

const getSupportedConnectors = () => {
  let a=[];
  a.push("SIWC");
  return a;
}

export {
  getSupportedConnectors,
  getConnectorDisplayName
};
