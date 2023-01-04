# 3. Create a message

The **async\_createMessage** function prepares a message ready for signing. If input params are incorrect, the function will fail, otherwise it will return a full message object, ready for consumption by the **async\_sendMessage** API.

```
// Basic message required input params 
let objParam= {
    message: "A message for authenticating the user",
    version: "1.0",
    valid_for: 300, 
}

// Request the full message object ready to be signed by user
let objMsg = await this.siww.async_createMessage(_idWallet, objParam);
```

Note that a fully formed message object contains property/values as follows:

* **domain**: string ; dns authority that is requesting the signing
* **address**: string ; address performing the signing
* **message**: string ; message statement that the user will sign
* **version**: string ; version of the message
* **chain**: string ; chain that is being queried
* **name**: string ; name of wallet being queried
* **api**: object ; specific wallet api for calling signMessage, or null if generic
* **issued\_at**: date ; when this message was created
* **valid\_for**: number ; how many seconds the message is valid (after issued\_at)
* **nonce**: number ; randomized number used to prevent replay attacks
