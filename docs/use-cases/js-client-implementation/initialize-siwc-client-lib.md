# 1. Initialize SIWC client lib

**connectCardano.js** is the client library which allows the connection to the Cardano wallet, installed as a browser plugin. This library needs to be instantiated (new) and initialized (call initialize function with all required params).&#x20;

Note as per the code below, that we have preferred to use callback functions rather than be constrained to wait for async calls to succeed (or fail). This is not usual, but since the user may take a very long time before accepting requests from the wallet, we have favored this option.

```
import siwc_connect from "./connectCardano";

// instanciate SIWC lib
this.siwc=new siwc_connect();

// register all callbacks with SIWC
this.siwc.async_initialize({
    onNotifyAccessibleWallets: function(_aWallet){
        this.siwc_onNotifyWalletsAccessible(_aWallet);
    }.bind(this),
    onNotifyConnectedWallet: function(_wallet){
        this.siwc_onNotifyWalletConnected(_wallet);
    }.bind(this),
    onNotifySignedMessage: function(_wallet){
        this.siwc_onNotifySignedMessage(_wallet);
    }.bind(this),
});

```

As can be seen in the code above, the calling app can be notified of:

* All accessible wallets: if implemented, **onNotifyAccessibleWallets** is called at start up
* All connected wallets: if implemented, **onNotifyConnectedWallet** is called for each connected wallet at start up and each time a wallet gets connected by action of the user&#x20;
* On each signed message (failed or accepted): if implemented, **onNotifySignedMessage** is called each time a user signs or refuses to sign a message presented by the wallet

&#x20;
