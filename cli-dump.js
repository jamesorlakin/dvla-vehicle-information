var lib = require('./index.js');
lib(process.argv[2], function (data) {
    console.log(data);
});
