const express = require('express');
const router = express.Router();

const libCookie = require('../authenticate/cookie'); 

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
                username: dataUser.data.username
            }
        });    
    })
});

module.exports = router;