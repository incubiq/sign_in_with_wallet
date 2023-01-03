# Security considerations

**End-user Privacy**

End-user privacy is provided via the transfer of only the wallet public address, and a hash for the username. No private data about the user, other than those which can be found on-chain, can transit during authentication.

**Wallet and relying party combined security**

The relying party (in our case SignWithWallet.com) implement this specification for improved security to the end-user. Specifically, the wallet displays the `domain` for which authentication is required, and the relying party validates the wallet signature server side befor authorizing the authentication.

**Encryption**

SIWW is making use of encryption when storing in-browser client side data.
