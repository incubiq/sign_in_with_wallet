# Sample use of SIWW

This package is provided as an example of integration with signwithwallet.com
More information about the setup and implementation can also be found here: https://incubiq.gitbook.io/siww/use-cases/nodejs-backend-implementation

## Install

1/ Download the /backend_sample/ source code in a directory
2/ Run npm install => it will run on localhost:3003
3/ ngrok https 3003 => Use ngrok to have an external URL accessible from other websites
4/ Go to signwithwallet.com and in the admin page, edit the localhost config to add your ngrok session as the tunnel option
5/ run your ngrok URL in the browser, and make use of the delegated  authentication provided by signwithwallet.com 

## How it works

This NodeJS server runs by default on localhost:3003 ; It connects to https://signwithwallet.com (otherwise called Sign-In With Wallet or SIWW in the documentation) which provides the delegated authenticatin via web3 wallet signing. 

This sample code implements a full oAuth2 authentication via services provided by both signwithwallet.com and the other associated open source components. If you are interested in more details on nodeJS passport implementation, we rcommend reading this page: https://www.zachgollwitzer.com/posts/passport-js-course

## License

[MIT](LICENSE)

[node-url]: https://nodejs.org/en/download/
