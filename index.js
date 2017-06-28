var rp = require('request-promise');
var cheerio = require('cheerio');

function doConfirmation(numberplate) {
    var options = {
        method: 'POST',
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
        },
        body: 'Vrm=' + numberplate,
        uri: 'https://vehicleenquiry.service.gov.uk/ConfirmVehicle'
    }
    rp(options).then(function (data) {
        var page = cheerio.load(data);
        console.log(data);
    })
}

module.exports = function(numberplate, callback) {
    numberplate = numberplate.toLowerCase().replace(' ', '');
    doConfirmation(numberplate);
}
