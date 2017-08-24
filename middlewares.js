const fs = require('fs');
const path = require('path');
const utils = require('./utils.js');

function checkSettingsExist(req, res, next){
    if(!fs.existsSync(path.join(__dirname + '/db/settings.json'))){
           utils.saveSettingsFile().then(() =>{
           }).catch((error) => {
               console.log(error);
           });
    }

    next();
}

function errorHandler(err, req, res, next){
    console.log(err.stack);
    res.status(500).send(`Error is occure: ${err.message}, trace: ${err.stack}`);
}

function authorization(redirect) {
    return (req, res, next) => {
        if (req.path === '/login') return next();
        
        const is_admin = req.session.user.is_admin;
        if(!is_admin){
            return redirect(res);
        }
        next();
    }
};

function logger(req, res, next){
    console.log('teset');
    next();
};

function setupSession(req, res, next){
    if (!req.session.user){
        req.session.user = {};
        req.session.user.is_admin = false;
    }
    next();
};

module.exports = {
    checkSettingsExist,
    errorHandler,
    authorization,
    logger,
    setupSession
};