const registry = require('package-stream')()
var S3Config = require('s3-append').S3Config;
var config = new S3Config({
    "accessKeyId": process.env.AWS_S3_ACCESS_KEY,
    "secretAccessKey": process.env.AWS_S3_SECRET_KEY,
    "region": process.env.AWS_REGION_NAME,
    "bucket": process.env.AWS_BUCKET_NAME
});
var S3Append = require('s3-append').S3Append;
var S3Format = require('s3-append').Format;
var service = new S3Append(config, 'node-package-details.json', S3Format.Json);
var count = 0
registry
    .on('package', function (pkg) {
        console.log(count++)
        service.append(pkg)
        console.log("Inside flush");
        service.flush()
            .then(function () {
                console.log("Done!");
            })
            .catch(function (err) {
                console.error(err.message);
            });
    })
    .on('error', function (err) {
        console.error(err)
        service.flush()
            .then(function () {
                console.log("Done!");
            })
            .catch(function (err) {
                console.error(err.message);
            });
    })
    .on('up-to-date', function () {
        service.flush()
            .then(function () {
                console.log("Done!");
            })
            .catch(function (err) {
                console.error(err.message);
            });
        process.stdout.write(JSON.stringify(dependents))
        process.exit()
    })

