/*
dvla-vehicle-information by James Lakin.

This library emulates the HTTP requests a browser makes when using the GOV.UK's
Vehicle Enquiry service. As such changes in the web design could render this library
inoperable.
*/

var rp = require('request-promise');
var cheerio = require('cheerio');

function doConfirmation(numberplate) {
    var options = {
        method: 'POST',
        url: 'https://vehicleenquiry.service.gov.uk/ConfirmVehicle',
        headers:
        {
            'cache-control': 'no-cache',
            'content-type': 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW'
        },
        formData: { Vrm: numberplate }
    };
    rp(options).then(function (data) {
        var page = cheerio.load(data);
        var formData = page("input").toArray().map(function (item) {
            if (item.attribs.value != "False") { // The radio button for "This isn't my car" should be ignored.
                return {
                    name: item.attribs.name,
                    value: item.attribs.value
                }
            }
        }).filter(function (item) { // Annoyingly you can't skip in a map, so we get rid of the undefined values now.
            if (item == undefined) return false;
            return true;
        });
        fetchVehicleDetails(formData);
    })
}

function fetchVehicleDetails(formData) {
    var postData = {};
    formData.forEach(function (item) {
        postData[item.name] = item.value;
    });
    console.log(postData);
}

module.exports = function(numberplate, callback) {
    numberplate = numberplate.toLowerCase().replace(' ', '');
    doConfirmation(numberplate);
}
