
const express = require('express');
const router = express.Router();
const routeBase = require('./utils');

/*
 *      Private routes (requires login)
 */

// For checking we are logged in correctly
router.get("/", function(req, res, next) {
    routeBase.async_apiGet(req, res, objUsername => {
        const Q = require('q');
        const deferred = Q.defer();
        deferred.resolve({
            data: {
                username: objUsername.username,
                authenticated: true
            }
        });
        return deferred.promise;
    }, {username: req.user.username});
});

module.exports = router;
