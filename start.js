const Service = require('node-windows').Service;

const svc = new Service({
    name: 'Remote folder remover',
    description: 'Web app for node remover on 3000',
    script: require('path').join(__dirname, 'index.js')
});


svc.on('install', () => {
    svc.start();
});

svc.install();