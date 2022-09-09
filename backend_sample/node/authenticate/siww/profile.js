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
            profile.provider = 'SIWW';
            profile.id = user.username;
            profile.chain = user.chain;
            profile.address = user.address;
            profile.username = user.username;
            profile.displayName = user.firstName +' '+user.lastName;
            profile.name = {
                familyName: user.lastName,
                givenName: user.firstName
            };
            profile.emails = [{value: user.email}];
        }
        return profile;
    };