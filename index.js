/*
dvla-vehicle-information by James Lakin.

This library emulates the HTTP requests a browser makes when using the GOV.UK's
Vehicle Enquiry service. As such changes in the web design could render this library
inoperable.
*/

var rp = require('request-promise');
var cheerio = require('cheerio');

var userCallback;

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
        console.log("Done 1");
        fetchVehicleDetails(formData);
    })
}

function fetchVehicleDetails(formData) {
    var postData = {};
    formData.forEach(function (item) { // Get the values in a suitable format for the HTTP request
        postData[item.name] = item.value;
    });
    var options = {
        method: 'POST',
        url: 'https://vehicleenquiry.service.gov.uk/ViewVehicle',
        headers:
        {
            'cache-control': 'no-cache',
            'content-type': 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW'
        },
        formData: postData
    };

    rp(options).then(function (data) {
        var page = cheerio.load(data);

        var vehicleInformation = {
            taxDate: page(".status-bar").children().first().children().first().children("p").text(),
            taxed: page(".status-bar").children().first().children().first().children("h2").text(),
            motDate: page(".status-bar").children().last().children().first().children("p").text(),
            mot: page(".status-bar").children().last().children().first().children("h2").text()
        }
        console.log(vehicleInformation);
    });
}

module.exports = function(numberplate, callback) {
    userCallback = callback;
    numberplate = numberplate.toLowerCase().replace(' ', '');
    console.log("Doing 1");
    doConfirmation(numberplate);
}
