const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const app = express(); 
const argv = require('minimist')(process.argv.slice(2));

const PORT = argv.port ? argv.port : '3000';

const middlewares = require('./middlewares.js');
const utils = require('./utils.js');

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, "views"));


app.use(express.static('public'));


app.use(session({secret: 'top-secret', saveUninitialized: false, maxAge: 30000, resave: true}));
app.use(bodyParser.urlencoded({extended: true}));
app.use(middlewares.checkSettingsExist);
app.use(middlewares.setupSession);
app.use(middlewares.authorization((res) => {res.redirect('/login')}));
app.use(middlewares.errorHandler);

app.get('/', (req, res) => {
    res.render('index');
});

let ERROR = null;
let SUCCESS = null;

app.get('/remove', (req, res) => {
    utils.getAttribute('path')
        .then(result => {
            return utils.removeDirectory(result)
                .then(_ => {
                    SUCCESS = true;
                    res.redirect('/success');
                });
        })
        .catch((err) => {
            ERROR = err;
            res.redirect('/error');
        })
});

app.get('/settings', (req, res) => {
    utils.getAttribute('path')
        .then(result =>{
            res.render('settings', {path: result});
        })
});

app.get('/success', (req, res) => {
    if (!SUCCESS) {
        return res.redirect('/');
    }

    res.render('success');
});

app.get('/error', (req, res) => {
    if (!ERROR) {
        return res.redirect('/');
    }
    console.log(ERROR.message);
    
    res.render('error', {message: ERROR && ERROR.message});
});

app.post('/settings', (req, res) => {
    const path = req.body.path;
    const password = req.body.password;
    if(!path){
        return res.render('settings', {errors: {path: 'Folder path may not be empty!'}, path: ''})
    }

    if(!password){
        return res.render('settings', {errors: {password: 'Password may not be empty!'}});
    }

    utils.saveSettings({path, password})
        .then(_ => {
            res.redirect('/');
        }).catch(err =>{
            throw err;
        });
    
});

app.get('/login', (req, res) => {
    utils.getAttribute('password')
        .then(result => {
            if (result === ''){
                req.session.user.is_admin = true;
                return res.redirect('/settings');
            } else {
                res.render('login');
            }
        });
});

app.post('/login', (req, res) => {
    const password = req.body.password;
    if(!password){
        req.session.user.is_admin = false;
        return res.render('login', {error: {message: 'Password may not be empty!'}});
    }

    utils.getAttribute('password')
        .then(result => {
            if (result === ''){
                req.session.user.is_admin = true;
                return res.redirect('settings');
            }
            if (password !== result){
                req.session.user.is_admin = false;
                return res.render('login', {error: {message: 'This is wrong password'}});
            }

            req.session.user.is_admin = true;
            return res.redirect('/');
        })
        .catch(err => {
            throw err;
        });
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
});
