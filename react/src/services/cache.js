import CryptoJS  from 'crypto-js'

let gKeyEncrypt=null;

const hasCacheEncryption = () => {
  return gKeyEncrypt!==null;
}

const setCacheEncryption = (strKey) => {
  gKeyEncrypt=strKey;
}

const getCache = (entry, optional_objParam) => {
    var localCache=localStorage.getItem(entry);
    if((localCache===null) || (localCache === "undefined") || (localCache==="null"))
        return null;
    if(optional_objParam===undefined) {
        optional_objParam={
            bEncrypt: hasCacheEncryption(),
            password: gKeyEncrypt
        };
    }

    if ((localCache.substring(0, 9)==='_ENCRYPT_') && optional_objParam.hasOwnProperty("password")) {
        try {
          let strDecrypt=localCache.substring(9, localCache.length);
          let bytes = CryptoJS.AES.decrypt(strDecrypt, optional_objParam.password);
          localCache = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
        }
        catch (e) {
            localCache=null;
        }
    }
    return localCache;
}

const setCache = (entry, json, optional_objParam) => {
  if(optional_objParam===undefined) {
      optional_objParam={
          bEncrypt: hasCacheEncryption(),
          password: gKeyEncrypt
      };
  }

  let value=json;
  let isEncrypted=false;
  if(optional_objParam.bEncrypt) {
    value = CryptoJS.AES.encrypt(JSON.stringify(json), optional_objParam.password).toString();
    isEncrypted=true;
  }
  try{
      if(isEncrypted) {
        value="_ENCRYPT_"+value;
      }
      localStorage.setItem(entry, value);
  }
  catch(e) {
      // could not set it? erase previous version
      localStorage.setItem(entry, "");
  }
}

// push an object in array of [entry][]
const pushToCacheEntry = (entry, objExtra, optional_objParam) => {
    let _aCache=getCache(entry, optional_objParam);   // load current cache
    if(!_aCache) {
      _aCache=[];
    }
    _aCache.push(objExtra);    // add new extra obj to it
    let aCache = [...new Set(_aCache)];   // remove the duplicates
    setCache(entry, aCache, optional_objParam);
    return aCache;
}

const pullFromCacheEntry = (entry, objId, optional_objParam) => {
  let _aCache=getCache(entry, optional_objParam);   // load current cache
  if(!_aCache) {
    _aCache=[];
  }

  let _aRet=[]
  for(var i=0; i< _aCache.length ; i++) {
    for(var name in objId) {
      if(_aCache[i][name]!==objId[name]) {
        _aRet.push(_aCache[i]);
      }
    }
  }
  setCache(entry, _aRet, optional_objParam);
  return _aRet;
}

// find an object in array of [entry][]
const getFromCacheEntry = (entry, objFilter, optional_objParam) => {
  let _aCache=getCache(entry, optional_objParam);   // load current cache
  if(!_aCache) {
    _aCache=[];
  }
  let objRet=_aCache.find(obj => {
    return obj[objFilter.entry] === objFilter.value;
  });

  return objRet;
}

const removeCache = (entry) => {
    localStorage.removeItem(entry);
}


export {
  hasCacheEncryption,
  setCacheEncryption,
  getCache,
  setCache,
  pushToCacheEntry,
  pullFromCacheEntry,
  getFromCacheEntry,
  removeCache
};
