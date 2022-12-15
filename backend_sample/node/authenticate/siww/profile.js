/**
 * Parse profile.
 *
 * @param {object|string} json
 * @return {object}
 * @access public
 */

    exports.parse = function(json) {
        if ('string' == typeof json) {
            try {
                json = JSON.parse(json);
            } catch (ex) {
                return ex;
            }
        }

        let profile = {};
        let user = json.data;
        if (user) { // Populate the profile fields using a standard format
            profile.connector = user.provider? user.provider.connector: null;
            profile.blockchain = user.provider? user.provider.blockchain: null;
            profile.wallet = user.provider? user.provider.wallet_id: null;
            profile.id = user.username;

            // authorizations
            profile.authorizations = user.authorizations;

            // datashare (from scope)
            profile.wallet_address = user.data? user.data.wallet_address: null;
            profile.username = user.data? user.data.username : null;
            profile.displayName = user.data && user.data.firstName && user.data.lastName?  user.data.firstName +' '+user.data.lastName : ""
            profile.name = {
                familyName: user.data && user.data.lastName?  user.data.lastName : null,
                givenName: user.data && user.data.firstName ? user.data.firstName : null
            };
            profile.emails = user.data && user.data.email? [{value: user.data.email}] : [];
        }
        return profile;
    };