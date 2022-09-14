import {setCacheEncryption, getCache, setCache} from './cache'

const CACHE_ME="me"

const getMyIdentities = () => {
    let objMe=getCache(CACHE_ME);
    return objMe? objMe.identities : [];
}

const _findIdentityFromWalletAddress = (_wallet_address) => {
  let aId=getMyIdentities();
  if(_wallet_address && aId && aId.length>0) {
    for (var i=0; i<aId.length; i++) {
      if (aId[i].wallet_address===_wallet_address) {
        return aId[i];
      }
    }
  }
  return null;
}

const getIdentityFromWalletAddress = (_wallet_address) => {
  let objMe=getCache(CACHE_ME);
  if(objMe && objMe.identities && objMe.identities.length>0) {
    return _findIdentityFromWalletAddress(_wallet_address);
  }
  return null;
}

const ensureIdentity = (_objIdentity) => {
  let objMe=getCache(CACHE_ME);
  if(!objMe) {
    objMe={identities: []};
  }
  if(_findIdentityFromWalletAddress(_objIdentity.wallet_address)===null) {
    objMe.identities.push(_objIdentity);
    setCache(CACHE_ME, objMe);
  }
  return objMe;
}

const updateIdentity = (_wallet_address, _objUpdate) => {
  let objIdentity=_findIdentityFromWalletAddress(_wallet_address);
  if(objIdentity) {
    for (const key in _objUpdate) {
      objIdentity[key]=_objUpdate[key];
    }
    let aId=getMyIdentities();
    for (var i=0; i<aId.length; i++) {
      if(aId[i].wallet_address===_wallet_address) {
        aId[i]=objIdentity;
      }
    }
    setCache(CACHE_ME, {identities: aId});
  }
}


export {
  CACHE_ME,
  getMyIdentities,
  getIdentityFromWalletAddress,
  ensureIdentity,
  updateIdentity
};
