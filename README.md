# dvla-vehicle-information

A very ugly library to request basic vehicle infomation from the GOV.UK website. Works by making a couple of HTTP requests that a browser normally would, and then scrapes the resulting HTML. Very hacky, but there's no official API that I can see.

Of course, this means the library is subject to **sudden breakages** should the GOV.UK website change.

# Usage

- Install using npm: `npm install dvla-vehicle-information`
- Import into your code: `var dvlaInfo = require('dvla-vehicle-information')`
- Requiring the library imports a function: `dvlaInfo(numberplate, callback)`
- After the function has completed, the callback will be executed with the following object if successful:
```
{
    taxDate: '01 June 2018',
    taxed: true,
    motDate: '24 July 2018',
    mot: true,
    'Vehicle make': 'SKODA',
    'Date of first registration': 'July 2009',
    'Year of manufacture': '2009',
    'Cylinder capacity (cc)': '1422 cc',
    'CO₂Emissions': '120 g/km',
    'Fuel type': 'DIESEL',
    'Export marker': 'No',
    'Vehicle status': 'Tax not due',
    'Vehicle colour': ' RED',
    'Vehicle type approval': 'M1',
    Wheelplan: '2 AXLE RIGID BODY',
    'Revenue weight': 'Not available'
}
```

Running the `cli-dump.js` with a numberplate as its argument will spit out the resulting object to the command line. This is useful for quick tests of lookups.

#### Note that this library does not yet implement error reporting and development is in its early stages. Any unmatched numberplates will currently return the following:
```
{
    taxDate: '',
    taxed: true,
    motDate: '',
    mot: true }
```

# Examples

- **Reminders** - This library was built to integrate MOT and tax reminders into a Facebook chat bot I built, using the excellent facebook-chat-api on npm.
- **ANPR** - Integrate enriched data into a basic ANPR system.
- **Being nosey** - Look up info for the thrill.

# Licence

This library is released under the GPL V2.

# Development

Pull requests are highly encouraged and welcomed.
