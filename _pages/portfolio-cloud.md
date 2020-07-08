---
permalink: /portfolio/cloud/
layout: image-expand
title: Portfolio 
published: true

---

## Certifications

- AWS Certified Solutions Architect Associate. [Verify](https://www.certmetrics.com/amazon/public/badge.aspx?i=1&t=c&d=2019-07-31&ci=AWS00914626)

## Projects

### Shorty
[https://shorty.skghosh.me](https://shorty.skghosh.me)

Serverless URL shortener written in Python using the [serverless framework](http://serverless.com/). It uses _Lambda_ functions as the serverless backend, and _DynamoDB_ as the database. _S3_ is used for the static frontend, and finally _Cloudfront_ is used as a reverse proxy.

- The Github repo is available @ [https://github.com/SkullTech/shorty.serverless](https://github.com/SkullTech/shorty.serverless)
- The API documentation is built with [Swagger](https://swagger.io/tools/swagger-ui/) and is available @ [https://shorty.skghosh.me/swagger/](https://github.com/SkullTech/shorty.serverless)
- Check out [this blog post](https://sumit-ghosh.com/articles/serverless-url-shortner-lambda-s3-cloudfront/) explaining the application and its architecture.

![architecture diagram](/images/portfolio/shorty.serverless.png?raw=true)


### Tuskii

Designed the cloud architecture for a vehicle tracking and monitoring service.

It uses a lot of AWS components to build a resilient and robust system. An IoT device component is installed in the car, which is sending logs to the cloud using _IoT Basic Ingest_ and _Kinesis Firehose_. The data is then being parsed with a _Lambda_ function and subsequently stored to a _DynamoDB_ table. At the same time, the raw data coming in through _Kinesis Firehose_ is stored to a _S3_ data lake. Finally, _Kinesis Data Analytics_, _IoT Analytics_ and _Amazon Quicksight_ are being used to monitor and visualize the data coming in.

![architecture diagram](/images/portfolio/Tuskii.png?raw=true)

