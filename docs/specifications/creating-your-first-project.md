# Abstract

_**Sign-In with Cardano**_ allows Cardano account owners to authenticate with off-chain services by signing a standard message format, which contains:

* a scope (metadata to be shared)
* session details (where to connect to, how long)
* security mechanisms (e.g., a nonce).&#x20;

The goals of this specification are to provide a self-custody alternative to centralized identity providers, improve interoperability across off-chain services for Cardano-based authentication, and provide wallet vendors and website/app owners with a consistent solution for improving end-user experience during authentication and consent management.

{% hint style="warning" %}
SIWC depends on the full implementation of CIP008, which at this stage, is not yet validated or implemented in wallets. This project is progressing on the assumption that CIP008 will be validated and implemented in the short term.
{% endhint %}
