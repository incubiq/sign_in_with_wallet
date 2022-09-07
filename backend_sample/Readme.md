# Sample use of SIWC


This package is in development and is not guaranteed stable yet. You can find the broader context on this repo : https://github.com/Yeepeekoo/sign_in_with_cardano and a documentation, also in progress, here: https://eric-duneau.gitbook.io/siwc/ 

A full NodeJS backend is being developped with a compatible Passport library for signing a user via a wallet into web2 apps. This will be shared publicly nearer to completion, planned for mid Q4 2022.

## Install

Download the /backend_sample/ source code in a directory, and run npm install

## How it works

This NodeJS server runs by default on localhost:3003 ; It requires a SIWW (Sign-In With Wallet) server running alongside to pass the authentication stage (see backend_siww). It implement a basic authentication via oAuth, making use of the SIWW passport extension.

Steps to perform an oAuth authentication via a Cardano wallet:
 1/ call the route /auth/prepare/siwc
  - this route will ensure that the current domain is registered with SIWW (we do this at each authentication call because SIWW does not keep a log of all connecting apps since it does not have any DB)
  - when domain registration is made, it auto redirects to route /auth/siwc which will make use of nodejs passport for the proper oAuth authentication

 2/ route /auth/siwc is called
  - it kick starts the passport SIWC authentication process.

## License

[MIT](LICENSE)

[node-url]: https://nodejs.org/en/download/
