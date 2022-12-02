
module.exports = {
    async_apiGet,
    async_apiPost
};

/*
 *      Base route fcts and helpers
 */

function _error(res, err) {
    res.status(err.status).send({
        data: null,
        status: err.status,
        message: err.message
    });        
}

async function async_apiGet(req, res, fn, obj){
    try {
        let dataRet=await fn(obj);
        res.status(dataRet.status);
        res.set('Cache-Control', 'public, max-age=31557600');           // cache this call 
        res.json(dataRet);
    }
    catch(err) {
        _error(res, err);
    }
}

async function async_apiPost(req, res, fn, obj){
    try {
        let dataRet=await fn(obj);
        if (dataRet && dataRet.data) {
            res.status(201);            // resource was created
        }
        res.json(dataRet);
    }
    catch(err) {
        _error(res, err);
    }
}