# :spider_web: webapp

RESTful Backend API service for a web application.

Demo API for reference: [Swaggerhub](https://app.swaggerhub.com/apis-docs/fall2022-csye6225/cloud-native-webapp/assignment-01)

## :package: Prerequisites

To install and run the app locally, you need to have the following installed on your local system:

- `git` (configured with ssh) [[link](https://git-scm.com/downloads)]
- `node v.16.17.0` and above [[link](https://nodejs.org/en/download/)]
- `yarn` (package manager) [[link]((https://formulae.brew.sh/formula/yarn))]
- `Postman` to demo hit the APIs [[link](https://www.postman.com/downloads/)]
-

## :arrow_heading_down: Installation

> **Prerequisite:** You need to have ssh configured on your local system to clone this project using _ssh_.

- Clone the server side API service using the following command:

```shell
git clone git@github.com:ArtemisIX/webapp.git
```

> The above command will clone the organization repository. Incase you want to clone the forked repository, use the following command:

```shell
git clone git@github.com:sydrawat01/webapp.git
```

- You'll need to install the dependencies as well:

```shell
  #for yarn users
  yarn
  #for npm users
  npm i
```

## :hammer_and_wrench: Build

To build the application, run the following command:

```shell
  #for yarn users
  yarn build
  #for npm users
  npm run build
```

## :construction: Development

> Make sure to have a valid .env file before running the following commands. You can view the [.env.example](./.env.example) file for reference.

To run the server in `dev` mode, run the following command:

```shell
  #for yarn users
  yarn start:dev
  #for npm users
  npm run start:dev
```

> This serves the app on `localhost:3000` via the unless you specify a `PORT` number in the .env file.

## :test_tube: Testing

To run the test suite, use the following commannds:

- To run the test suite in interactive mode:

```shell
  #for yarn users
  yarn test:dev
  #for npm users
  npm run test:dev
```

- To run the test suite without interactive mode:

```shell
  #for yarn users
  yarn test
  #for npm users
  npm run test
```

## :rocket: Production

To run the app in production mode, use the following command:

```shell
  #for yarn users
  yarn start
  #for npm users
  npm run start
```

## :ninja: Author

[Siddharth Rawat](mailto:rawat.sid@northeastern.edu)

## :scroll: License

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./License)
