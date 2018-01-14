const registry = require('package-stream')()
var jsonfile = require('jsonfile')
var file = 'node-package-details.json'
var count = 0
registry
    .on('package', function (pkg) {
        console.log(count++)
        jsonfile.writeFile(file, pkg, {flag: 'a'}, function (err) {
            if(err != null) {
                console.error(err)
            }
          })
    })
    .on('error', function (err) {
        console.error(err)
    })
    .on('up-to-date', function () {
        console.log('Done with collecting data')
        process.stdout.write(JSON.stringify(dependents))
        process.exit()
    })

