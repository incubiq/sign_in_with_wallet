# Sign-in with Wallet (SIWW)

## Introduction

A web2 <-> web3 integration for authenticating end-users into web2 apps via their crypto wallet. First implementation based on Cardano wallets, but kept as generic as possible to allow plugging other wallets later.

A good part of this project is provided as open source, althoug for security reasons, the oAuth backend is kept private. All the open source components are either in this repo, or in additional npm repos (see below)

## Open source components

 - Wallet connector JS library @incubiq/siww (https://www.npmjs.com/package/@incubiq/siww) which is delivered as a separate module, as part of this project.

 - Passport extension @incubiq/passport-wallet (https://www.npmjs.com/package/@incubiq/passport-wallet) which is also delivered as a separate module, as part of this project.

 - React app. the entire client UI of the SIWW project. This react App uses the wallet connector JS Lib to authenticate user in wallet, and then connects to the oAuth backend for final oAuth2 processing

 - Sample app: a simple NodeJS app with a full integration of the Sign With Wallet feature is provided in this repo. 

## Installating the sample app 

To sample app:
 - download the source
 - place yourself in the directory
 - run: "npm start" (or yarn start)
 - the app will run by default on "http://localhost:3003"
 - IMPORTANT: to connect with the signwithwallet.com production oAuth2 backend, this sample app must run on a domain accessible from outside your localhost machine. To setup the sample once it runs on localhost, please follow the install tutorial here : https://youtu.be/PYerg9GjCfM 

## Prod environment

The prod app is running on: https://SignWithWallet.com

## Support

If you are interested in this project and would like to learn more, help on testing, or give some input on requirements, you are welcome to send email to eric [at] incubiq [dot] com with title [Sign-in with Wallet].