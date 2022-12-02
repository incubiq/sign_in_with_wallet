# Open source libraries

Most of the code has been released as open source. Since there are several implementations, a quick overview of the architecture is helpful. See the presentation below, and then each module.



<figure><img src="../.gitbook/assets/Screenshot 2022-12-02 at 11.32.35.png" alt=""><figcaption></figcaption></figure>

To implement an oAuth2 authentication from your backend app into SIWW, you can make use of the relevant passport strategy.

{% hint style="info" %}
**passport-wallet:** a simple passport extension to deal with authenticating a user based on information retrieved from a wallet
{% endhint %}

{% embed url="https://www.npmjs.com/package/@incubiq/passport-wallet" %}

A full NodeJS sample implementation, making use of the above passport-wallet strategy, is provided as an example.

{% hint style="info" %}
**NodeJS sample app**: a complete sample app to demo the connection to SIWW and the complete implementation of an oAuth2 authentication.
{% endhint %}

{% embed url="https://github.com/incubiq/sign_in_with_wallet/tree/main/backend_sample" %}

A wallet connect library has been provided too. It has a generic implementation, and a specific extension for managing Cardano-based wallet plugins. This library could later evolve to support other wallets on other blockchains.

{% hint style="info" %}
**SIWW wallet connect library**: this wallet connection JS library comes with a generic implementation, and a first specific extension to support Cardano wallet browser plugins.
{% endhint %}

{% embed url="https://www.npmjs.com/package/@incubiq/siww" %}

The full wallet connection and authentication/authorization UI/UX is open-sourced too. It is developed as a React App, which is making use of the SIWW wallet connect client library, and is integrating into the SIWW backend.

{% hint style="info" %}
**Authentication React App**: connects with the SIWW backend to provide the full oAuth2 authentication.&#x20;
{% endhint %}

{% embed url="https://github.com/incubiq/sign_in_with_wallet/tree/main/react" %}
