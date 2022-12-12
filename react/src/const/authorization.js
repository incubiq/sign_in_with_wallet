
const AUTHORIZATION_CONDITION_PROPERTY_COIN = "coin"
const AUTHORIZATION_CONDITION_PROPERTY_ADA = "ADA"
const AUTHORIZATION_CONDITION_PROPERTY_POLICY = "policy"

const AUTHORIZATION_CONDITION_OPERATOR_LESSTHAN = "less"
const AUTHORIZATION_CONDITION_OPERATOR_MORETHAN = "more"
const AUTHORIZATION_CONDITION_OPERATOR_EXACT = "exact"

const getAuthorizationOperator = (_prop) => {
  switch(_prop) {
    case AUTHORIZATION_CONDITION_OPERATOR_MORETHAN: 
    return {
      value: AUTHORIZATION_CONDITION_OPERATOR_MORETHAN,
      display: "at least",
      type: "number"
    };

    case AUTHORIZATION_CONDITION_OPERATOR_LESSTHAN: 
    return {
      value: AUTHORIZATION_CONDITION_OPERATOR_LESSTHAN,
      display: "at most",
      type: "number"
    };

    case AUTHORIZATION_CONDITION_OPERATOR_EXACT: 
    return {
      value: AUTHORIZATION_CONDITION_OPERATOR_EXACT,
      display: "contains",
      type: "text"
    };

    default:     
      return {
        value: "",
        display: "",
        type: "text"
      };
  }
}

const getAuthorizationCondition = (_prop) => {
  switch(_prop) {
    case AUTHORIZATION_CONDITION_PROPERTY_ADA: 
      return {
        property: AUTHORIZATION_CONDITION_PROPERTY_ADA,
        display : "ADA Balance",
        default: AUTHORIZATION_CONDITION_OPERATOR_MORETHAN,
        connector : "SIWC"
      };

    case AUTHORIZATION_CONDITION_PROPERTY_POLICY: 
      return {
        property: AUTHORIZATION_CONDITION_PROPERTY_POLICY,
        display: "Policy ID",
        default: AUTHORIZATION_CONDITION_OPERATOR_EXACT,
        connector : "SIWC"
      };

    default: 
      return null;
  }
}

  const getAuthorizationOperators = (_prop) => { 
    switch(_prop) {
      case AUTHORIZATION_CONDITION_PROPERTY_ADA: 
      case AUTHORIZATION_CONDITION_PROPERTY_COIN: 
        return [
          getAuthorizationOperator(AUTHORIZATION_CONDITION_OPERATOR_MORETHAN),  
          getAuthorizationOperator(AUTHORIZATION_CONDITION_OPERATOR_LESSTHAN)
        ];
  
      case AUTHORIZATION_CONDITION_PROPERTY_POLICY: 
      return [
        getAuthorizationOperator(AUTHORIZATION_CONDITION_OPERATOR_EXACT)
      ];

      default: 
        return [];
    }
  }
  
  const getAuthorizationConditions = (_connector) => {
    switch(_connector) {
      case "SIWC":
        return [
          getAuthorizationCondition(AUTHORIZATION_CONDITION_PROPERTY_ADA),
          getAuthorizationCondition(AUTHORIZATION_CONDITION_PROPERTY_POLICY)
        ];

      default: 
        return [];      
    }
}


export {
  getAuthorizationOperator,
  getAuthorizationOperators,
  getAuthorizationCondition,
  getAuthorizationConditions,
};
