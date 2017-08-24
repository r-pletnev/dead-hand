const path = require('path');
const fs = require('fs');
const rmdir = require('rimraf');

const SETTINGS = path.join(__dirname + '/db/settings.json');
const initialSettings = {password: '', path: ''};

function saveSettingsFile(state=initialSettings){
    return new Promise ((resolve, reject) => {
        fs.writeFile(SETTINGS, JSON.stringify(state,null, 2), (err) =>{
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    })
}

function readSettings(){
    return new Promise((resolve, reject) => {
        fs.readFile(SETTINGS, (err, data) => {
            if(err){
                reject(err);
            } else {
                resolve(JSON.parse(data));
            }
        });
    });
}


function saveAttribute(name, value){
    const obj = {[name]: value};
    return readSettings()
        .then(res => {
            const newSettings = Object.assign(res, obj);
            return saveSettingsFile(newSettings);
        })
        .catch(err => {
            throw (err);
        });
}

function saveSettings(settings){
    return saveSettingsFile(settings)
        .catch(err => {
            throw err;
        })
};

function getAttribute(name){
    return readSettings()
        .then(res => (res[name]))
        .catch(err => {
            throw(err)}
         );
}

function removeDirectory(path){
    return new Promise((resolve, reject) => {
        rmdir(path, (err) => {
            if(err) {
                reject(err);
            }
            resolve();
        });
    });
}

module.exports = {
    saveSettingsFile,
    saveAttribute,
    getAttribute,
    removeDirectory,
    saveSettings
};
