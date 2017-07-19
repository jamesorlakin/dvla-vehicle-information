/*
dvla-vehicle-information by James Lakin.

This library emulates the HTTP requests a browser makes when using the GOV.UK's
Vehicle Enquiry service and parses the returned HTML. As such, changes in the
web design could render this library inoperable.

There are two HTTP requsts:
First, we run the "doConfirmation" function to get the viewstate input.
Then we run the "fetchVehicleDetails" function to return the full data about a vehicle.
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
            taxDate: page(".status-bar").children().first().children().first().children("p").text().substr(8),
            taxed: !(page(".status-bar").children().first().children().first().children("h2").text().indexOf("Untaxed")>-1),
            motDate: page(".status-bar").children().last().children().first().children("p").text().substr(8),
            mot: !(page(".status-bar").children().last().children().first().children("h2").text().indexOf("No")>-1)
        }

        page('.list-summary').children().each(function(i, element) { // Fetch every row from the table
            var key = page(this).children().first().text();
            if (key == "Tax rates: ") return true; // Skip the tax rates link
            // Why strip two characters? Get rid of the ": ".
            vehicleInformation[key.substr(0, key.length-2)] = page(this).children().last().text()
        });

        userCallback(vehicleInformation);
    });
}

module.exports = function(numberplate, callback) {
    userCallback = callback;
    numberplate = numberplate.toLowerCase().replace(' ', '');
    doConfirmation(numberplate);
}
