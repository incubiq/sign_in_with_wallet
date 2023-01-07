import {getConnectors, CONNECTOR_SIWC} from "../../const/connectors"; 

const getConnectorDisplayName = (_connector) => {
  switch(_connector) {
    case CONNECTOR_SIWC.toLowerCase():
    case CONNECTOR_SIWC: 
      return getConnectors()[CONNECTOR_SIWC].display;

    default:
      return null;
  }
}

const getSupportedConnectors = () => {
  return getConnectors();
}

export {
  getSupportedConnectors,
  getConnectorDisplayName
};
