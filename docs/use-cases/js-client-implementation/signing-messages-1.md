# 4. Send a message

{% hint style="warning" %}
**Important**: this API depends on CPI008 currently not finalize / not implemented in wallets, therefore... for the moment, we are "faking" it and request a simple user confirmation which is NOT delivered by the wallet. The full API functionality shall be delivered when CPI008 is made available by wallets.
{% endhint %}

The **async\_signMessage** function sends a message to the wallet, for user signing. Several types of messages can be signed. At the moment, SIWC supports "authentication" and "revocation" types.

```
// Request the full message object ready to be signed by user
let objMsg = await async_createMessage(_idWallet, objCreate);

// now send message for user authentication
let objAuth = this.siwc.async_signMessage(_idWallet, objMsg, "authentication");
```

If successful, the API **async\_signedMessage** will return an object with the following attributes:

* **wasSigned**: boolean ; did the user accept or refuse this message at signing time?
* **type**: string ; the type of message ("authentication" or "revocation")
* **id**: string ; the wallet id
* **msg**: object ; the full message object as it was passed to the wallet for signing
