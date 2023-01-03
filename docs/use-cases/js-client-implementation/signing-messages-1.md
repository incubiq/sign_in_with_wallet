# 4. Send a message

The **async\_signMessage** function sends a message to the wallet, for user signing. Several types of messages can be signed. At the moment, SIWC supports "authentication" and "revocation" types.

```
// Request the full message object ready to be signed by user
let objMsg = await this.siwc.async_createMessage(_idWallet, objCreate);

// now send message for user authentication
let objAuth = this.siwc.async_signMessage(_idWallet, objMsg, "authentication");
```

If successful, the API **async\_signedMessage** will return an object with the following attributes:

* **connector**: string ; the connector used for signMessage ("SIWC" for Cardano)
* **signature**: string ; the COSE (cardano) signed message
* **key**: string ; the COSE key
* **type**: string ; the type of message ("authentication" or "revocation")
* **issued\_at**: string ; the UTC date time when the message was issued
* **valid\_for**: number ; how many seconds this message is valid for (from time of issued\_at)
* **address**: string ; the address of the signing entity (for sever validation)
