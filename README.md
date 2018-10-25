# aws-lambda-s3-screenshotter
AWS Lambda function that is triggered by an S3 create object action, renders the .html file using PhantomJS, screenshots a specific div based on class, &amp; saves it to another S3 bucket.

# About
This is kinda fine tuned to my use case & I am too lazy to make it more general use but I think it is a good jumping off point for anyone looking to do something similar so I decided to make it public. Look at the code & you should easily be able to tweak it for your use case. Best of luck!

# Includes
Compiled phantomJS v2.1.1 binary for linux x86_64

# Lambda setup
- Create function
- Give appropriate S3 permissions
- Setup S3 trigger on create object
- Create the following ENV variables
    - OUTPUT_BUCKET (The bucket to store the screenshot)
    - OUTPUT_PATH   (The path for the screenshot (filename comes from source filename))
    - SCREENSHOT_HEIGHT  (To set phantomjs' viewport's height but not so important since we trim the size to a specific div)
    - SCREENSHOT_WIDTH   (To set phantomjs' viewport's width but not so important since we trim the size to a specific div)
    - SCREENSHOT_TIMEOUT (Set a timeout for phantomjs)
    - ELEMENT_CLASS (Set the class that you want to screenshot. Only screenshots the first instance)
- Zip index.js & phantomjs folder & upload it to the lambda console
- For easy testing, create a S3 create object test event in the lambda console

# Example test
```
{
  "Records": [
    {
      "eventVersion": "2.0",
      "eventSource": "aws:s3",
      "awsRegion": "<REGION>",
      "eventTime": "1970-01-01T00:00:00.000Z",
      "eventName": "ObjectCreated:Put",
      "userIdentity": {
        "principalId": "EXAMPLE"
      },
      "requestParameters": {
        "sourceIPAddress": "127.0.0.1"
      },
      "responseElements": {
        "x-amz-request-id": "EXAMPLE123456789",
        "x-amz-id-2": "EXAMPLE123/5678abcdefghijklambdaisawesome/mnopqrstuvwxyzABCDEFGH"
      },
      "s3": {
        "s3SchemaVersion": "1.0",
        "configurationId": "testConfigRule",
        "bucket": {
          "name": "<SOURCE_BUCKET>",
          "ownerIdentity": {
            "principalId": "EXAMPLE"
          },
          "arn": "arn:aws:s3:::<SOURCE_BUCKET>"
        },
        "object": {
          "key": "<TEST_OBJECT>",
          "size": 1024,
          "eTag": "0123456789abcdef0123456789abcdef",
          "sequencer": "0A1B2C3D4E5F678901"
        }
      }
    }
  ]
}
```
