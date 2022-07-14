

const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('page_home', {
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
        }
    });
});

module.exports = router;
