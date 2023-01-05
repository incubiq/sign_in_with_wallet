# 1. Initialize SIWW client lib

A JS library for connecting to wallets is provided as open source. To install it, run the following command:

```
npm install @incubiq/siww
```

This client library allows the connection to any Cardano wallet, installed as a browser plugin.&#x20;

You will need to get the blockchain connector first (see the code below), and then initialize it with any required parameter.

Note that we have preferred to use callback functions rather than be constrained to wait for async calls to succeed (or fail). This is not usual, but since the user may take a very long time before accepting requests from the wallet, we have favored this option.

```
const SIWW = require('@incubiq/siww');

// instanciate the cardano connector
this.siww=SIWW.getConnector("cardano");

// register all callbacks with SIWW
this.siww.async_initialize({
    onNotifyAccessibleWallets: function(_aWallet){
        this.onSIWCNotify_WalletsAccessible(_aWallet);
    }.bind(this),
    onNotifyConnectedWallet: function(_wallet){
        this.onSIWCNotify_WalletConnected(_wallet);
    }.bind(this),
    onNotifySignedMessage: function(_wallet){
        this.onSIWCNotify_SignedMessage(_wallet);
    }.bind(this),
});
```

As can be seen in the code above, the calling app can be notified of:

* All accessible wallets: if implemented, **onNotifyAccessibleWallets** is called at start up.
* All connected wallets: if implemented, **onNotifyConnectedWallet** is called for each connected wallet at start up and each time a wallet gets connected by action of the user. It receives an object which establishes if the wallet is connected, and if so, which wallet name, and for which wallet address, and on which chain (mainnet / testnet).
* On each signed message (failed or accepted): if implemented, **onNotifySignedMessage** is called each time a user signs or refuses to sign a message presented by the wallet. Messages can be either for "authentication" or "revocation".
