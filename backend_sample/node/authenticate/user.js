
module.exports = {
    async_findUser,
    async_createUser
};

/*
 *      Very basic user Mgt (no database)
 */

    async function async_findUser(objFind) {
        // here look for user extra data in DB and return this info
        return {data: objFind}
    }

    async function async_createUser(objUser) {
        // here create user in DB and return this info
        return {data: objUser}
    }