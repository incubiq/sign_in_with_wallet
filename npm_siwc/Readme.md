# siwc

Sign-In With Cardano (still draft and in development...)

## Install

This module is installed directly using `npm`:

```sh
$ npm install @incubiq/siwc
```

## API

<!-- eslint-disable no-unused-vars -->

```js
import siwc from "@incubiq/siwc";
```

This library allows you to Authenticate via a Cardano compatible wallet

### siwc.async_connectWallet(_id)

Call this function to connect to a wallet whose ID is _id. 
If siwc was initialized with a callback, it will be called upon sucessful (or failed) connection.


### siwc.async_createMessage(_id, {})

Call this function to create a message and send it to the connected wallet. 

### siwc.async_signMessage(_id, {}, "authentication");

Call this function to ask a user to sign a message in the connected wallet. 
If siwc was initialized with a callback, it will be called upon sucessful (or failed) message creation.


## License

[MIT](LICENSE)

[node-url]: https://nodejs.org/en/download/
