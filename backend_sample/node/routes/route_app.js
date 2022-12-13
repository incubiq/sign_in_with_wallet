const express = require('express');
const router = express.Router();

const libCookie = require('../authenticate/cookie'); 

/*
 *      Route for when the user is logged in to the sample app
 */

router.get('/', function(req, res, next) {
    libCookie.async_getUserInfoFromCookie(req, gConfig.jwtKey)
    .then(function(dataUser){
        res.render('page_app', {
            config: gConfig,
            layout: 'marketing',
            url: "/",
            metadata: {
                type: "article",
                pathname: req.route.path,
                author: gConfig.email,
                keywords: gConfig.appName,
                description: "",
                title: gConfig.appDisplayName,
                theme_color: gConfig.theme_color
            },
            param: {
                username: dataUser.data.username,
                provider: dataUser.data.provider,
                authorizations: dataUser.data.authorizations,
                wallet_id: dataUser.data.wallet_id,
                wallet_address: dataUser.data.wallet_address,
            }
        });    
    })
});

module.exports = router;