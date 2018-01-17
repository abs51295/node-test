const registry = require('package-stream')()
var jsonfile = require('jsonfile')
var fs = require('fs'),
    S3FS = require('s3fs'),
    s3fsImpl = new S3FS(process.env.AWS_BUCKET_NAME, {
        accessKeyId: process.env.AWS_S3_ACCESS_KEY,
        secretAccessKey:  process.env.AWS_S3_SECRET_KEY,
        region: "us-east-2",
        signatureVersion: "v4",
        s3DisableBodySigning: false
    });
var file = 'node-package-details-clean.json'
var count = 0;
var once = false;
registry
    .on('package', function (pkg) {
        console.log(count++)
        if (pkg.keywords && typeof pkg.keywords === "string") {
            pkg.keywords = pkg.keywords.split(',')
        }
        var cleanPkg = {
            "name": pkg.name,
            "description": pkg.description,
            "version": pkg.version,
            "keywords": pkg.keywords,
            "dependencies": pkg.depNames,
            "devDependencies": pkg.devDepNames,
            "allDependencies": pkg.allDepNames
        }
        jsonfile.writeFile(file, cleanPkg, {flag: 'a'}, function (err) {
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
        //process.stdout.write(JSON.stringify(dependents))
        if(!once) {
            var stream = fs.createReadStream(file);
            s3fsImpl.writeFile(file, stream).then(function () {
                fs.unlink(file, function (err) {
                    if (err) {
                        console.error(err);
                        process.exit();
                    }
                });
                process.exit();
            });
            once  = true;
        }
    });

