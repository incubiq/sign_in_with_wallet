# 3. Create a message

The **async\_createMessage** function prepares a message ready for signing. If input params are incorrect, the function will fail, otherwise it will return a full message object, ready for consumption by the **async\_sendMessage** API.

```
// Basic message required input params 
let objParam= {
    message: "A message for authenticating the user",
    valid_for: 300, 
}

// Request the full message object ready to be signed by user
let objMsg = await async_createMessage(_idWallet, objParam);
```

Note that a fully formed message object contains property/values as follows:

* **domain**: string ; dns authority that is requesting the signing&#x20;
* **address**: string ; address performing the signing&#x20;
* **message**: string ; message statement that the user will sign&#x20;
* **version**: string ; version of the message&#x20;
* **chain**: string ; chain that is being queried&#x20;
* **name**: string ; name of wallet being queried&#x20;
* **issued\_at**: date ; when this message was created&#x20;
* **valid\_for**: number ; how many seconds the message is valid (after issued\_at)&#x20;
* **nonce**: number ; randomized number used to prevent replay attacks
