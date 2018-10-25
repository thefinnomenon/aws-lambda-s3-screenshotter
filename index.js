const exec = require('child_process').exec;
const fs = require('fs');
const AWS = require('aws-sdk');
var util = require('util');

exports.handler = (event, context, cb) => {
  console.log("Reading options from event:\n", util.inspect(event, {depth: 5}));

  // Parse event info
  const srcBucket = event.Records[0].s3.bucket.name;
  const srcRegion = event.Records[0].awsRegion;
  const srcKey = event.Records[0].s3.object.key;
  const srcUrl = `https://s3-${srcRegion}.amazonaws.com/${srcBucket}/${srcKey}`;
  const dstBucket = process.env.OUTPUT_BUCKET;
  const dstPath = process.env.OUTPUT_PATH;
  const srcPathSplit = srcKey.split('/');
  const srcFilenameWithExt = srcPathSplit[srcPathSplit.length-1];
  const srcFilename = srcFilenameWithExt.split('.')[0];
  const dstKey = `${dstPath}/${srcFilename}.png`;

  // Set phantomjs settings
  const screenWidth = process.env.SCREENSHOT_WIDTH;
  const screenHeight = process.env.SCREENSHOT_HEIGHT;
  const timeout = process.env.SCREENSHOT_TIMEOUT;
  const elementClass = process.env.ELEMENT_CLASS;

  console.log(`Snapshotting ${srcUrl} to s3://${dstBucket}/${dstKey}`);

  // build the cmd for phantom to render the url
  const cmd = `./phantomjs/phantomjs_linux-x86_64 --debug=yes --ignore-ssl-errors=true ./phantomjs/screenshot.js ${srcUrl} /tmp/${dstKey} ${screenWidth} ${screenHeight} ${timeout} ${elementClass}`; // eslint-disable-line max-len
  console.log(cmd);

  // run the phantomjs command
  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      console.warn(`exec error: ${error}`, stdout, stderr);
      cb(`422, please try again ${error}`);
    } else {
      // snapshotting succeeded, let's upload to S3
      // read the file into buffer (perhaps make this async?)
      const fileBuffer = fs.readFileSync(`/tmp/${dstKey}`);

      // upload the file
      const s3 = new AWS.S3();
      s3.putObject({
        ACL: 'public-read',
        Key: dstKey,
        Body: fileBuffer,
        Bucket: dstBucket,
        ContentType: 'image/png',
      }, (err) => {
        if (err) {
          console.warn(err);
          cb(err);
        } else {
          cb(null, {
            key: dstKey,
            bucket: dstBucket
          });
        }
        return;
      });
    }
  });
};