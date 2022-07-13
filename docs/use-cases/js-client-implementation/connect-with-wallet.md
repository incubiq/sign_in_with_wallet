# 2. Connect to a Wallet

{% hint style="info" %}
**Good to know:** wallet connection is per target application domain. If a wallet was connected to a domain in the past, unless the user removes this setting from the configuration of the wallet, it will always be connected at startup of a new browsing session for this same domain.
{% endhint %}

```
// request the user to accept / refuse a connection with a specific wallet
let objConnect = await this.siwc.async_connectWallet(_id);
```

Remember that the **async\_connectWallet** function above will return after some time (the time for the user to reply in the wallet). You have the choice to "await" this function call, or to let it go and get called back on the **onNotifyConnectedWallet** callback (see initialization params)

The \_id parameter used as input of **async\_connectWallet** is the ID of the wallet, as disclosed by the wallet itself. You get the list of all possible IDs at startup thanks to the **onNotifyAccessibleWallets** which returns the list of all available wallet IDs.
