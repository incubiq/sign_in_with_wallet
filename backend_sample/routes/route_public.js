
const express = require('express');
const router = express.Router();

/*
 *      Public routes
 */

// For checking we are running
router.get("/", function(req, res, next) {
    res.send({data: {
        status: "running",
        app: gConfig.appName,
        config: gConfig.env,
        host: gConfig.origin,
        version: gConfig.version
    }});
});

module.exports = router;
