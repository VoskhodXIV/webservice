# :spider_web: webapp

[![Packer custom AMI deployment to AWS Prod](https://github.com/ArtemisIX/webapp/actions/workflows/packer-build.yml/badge.svg)](https://github.com/ArtemisIX/webapp/actions/workflows/packer-build.yml)

RESTful Backend API service for a web application.

Demo API for reference: [Swaggerhub](https://app.swaggerhub.com/apis-docs/fall2022-csye6225/cloud-native-webapp/assignment-01)

## :package: Prerequisites

To install and run the app locally, you need to have the following installed on your local system:

- `git` (configured with ssh) [[link](https://git-scm.com/downloads)]
- `node v.16.17.0` and above [[link](https://nodejs.org/en/download/)]
- `yarn` (package manager) [[link](https://formulae.brew.sh/formula/yarn)]
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

## :hammer_and_wrench: Development

> Make sure to have a valid .env file before running the following commands. You can view the [.env.example](./.env.example) file for reference.

To run the server in `dev` mode, run the following command:

```shell
  #for yarn users
  yarn start:dev
  #for npm users
  npm run start:dev
```

> This serves the app on `http://0.0.0.0:1337` unless you specify a `PORT` number in the .env file.

### :busstop: API Endpoints

This cloud-native web application RESTful API mirror the API mentioned in the [Swagger Docs here](https://app.swaggerhub.com/apis-docs/fall2022-csye6225/cloud-native-webapp/assignment-02#/Account).

#### :closed_lock_with_key: Authenticated Users

- **GET** _/v1/account/{accountID}_ : Get the user account information
  - **AccountID:** String (Required)
  - **Response:** 200 _OK_, **Media Type:** Application/JSON
  - **Response:** 401 _Unauthorized_
  - **Response:** 403 _Forbidden_

- **PUT** _/v1/account/{accountID}_ : Update the user's account information
  - **AccountID:** String (Required)
  - **Request Body:** Application/JSON (Required)

    ```json
      {
        "first_name": "Jane",
        "last_name": "Doe",
        "password": "somepassword",
        "username": "jane.doe@example.com"
      }
    ```

  - **Response:** 204 _No Content_
  - **Response:** 400 _Bad Request_
  - **Response:** 401 _Unauthorized_
  - **Response:** 403 _Forbidden_

#### :unlock: Unauthenticated Users

- `**POST** _/v1/account_ : Create a user account
  - **Request Body:** Application/JSON (Required)

    ```json
      {
        "first_name": "Jane",
        "last_name": "Doe",
        "password": "somepassword",
        "username": "jane.doe@example.com"
      }
    ```

  - **Response:** 201 _User Created_
  - **Response** 400 _Bad Request_

#### Schemas

```text
  {
    id: string($uuid)
      example: d290f1ee-6c54-4b01-90e6-d701748f0851
      readOnly: true
    first_name*: string
      example: Jane
    last_name*: string
      example: Doe
    password*: string($password)
      example: somepassword
      writeOnly: true
    username*: string($email)
      example: jane.doe@example.com
    account_created: string($date-time)
      example: 2016-08-29T09:12:33.001Z
      readOnly: true
    account_updated: string($date-time)
      example: 2016-08-29T09:12:33.001Z
      readOnly: true
  }
```

## :test_tube: Testing

To run the test suite, use the following commands:

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

## :package: [Packer](https://learn.hashicorp.com/tutorials/packer/get-started-install-cli?in=packer/aws-get-started)

We will build custom AMI (Amazon Machine Image) using Packer from HashiCorp.

### :arrow_heading_down: Installing Packer

Install Packer using Homebrew (only on MacOS):

- First, install the HashiCorp tap, a repository of all our Homebrew packages:

```shell
brew tap hashicorp/tap
```

- Now, install Packer with `hashicorp/tap/packer`:

```shell
brew install hashicorp/tap/packer
```

- To update to the latest, run:

```shell
brew upgrade hashicorp/tap/packer
```

- After installing Packer, verify the installation worked by opening a new command prompt or console, and checking that `packer` is available:

```shell
packer
```

> NOTE: If you get an error that packer could not be found, then your PATH environment variable was not set up properly. Please go back and ensure that your PATH variable contains the directory which has Packer installed. Otherwise, Packer is installed and you're ready to go!

### :wrench: Building Custom AMI using Packer

Packer uses Hashicorp Configuration Language(HCL) to create a build template. We'll use the [Packer docs](https://www.packer.io/docs/templates/hcl_templates) to create the build template file.

> NOTE: The file should end with the `.pkr.hcl` extension to be parsed using the HCL2 format.

#### Create the `.pkr.hcl` template

The custom AMI should have the following features:

> NOTE: The builder to be used is `amazon-ebs`.

- **OS:** `Ubuntu 22.04 LTS`
- **Build:** built on the default VPC
- **Device Name:** `/dev/sda1/`
- **Volume Size:** `50GiB`
- **Volume Type:** `gp2`
- Have valid `provisioners`.
- Pre-installed dependencies using a shell script.
- Web application software pre-installed on the AMI.

#### Shell Provisioners

This will automate the process of updating the OS packages and installing software on the AMI and will have our application in a running state whenever the custom AMI is used to launch an EC2 instance. It should also copy artifacts to the AMI in order to get the application running. It is important to bootstrap our application here, instead of manually SSH-ing into the AMI instance.

Install application prerequisites, middlewares and runtime dependencies here. Update the permission and file ownership on the copied application artifacts.

> NOTE: The file provisioners must copy the application artifacts and configuration to the right location.

#### [systemd](https://systemd.io/)

`systemd` s a suite of basic building blocks for a Linux system. It provides a system and service manager that runs as PID 1 and starts the rest of the system.. This will help us bootstrap our application and have it in a running state when we launch our custom AMI EC2 instance using the CloudFormation stack.

#### Custom AMI creation

To create the custom AMI from the `.pkr.hcl` template created earlier, use the commands given below:

- If you're using Packer plugins , run the `init` command first:

```shell
# Installs all packer plugins mentioned in the config template
packer init .
```

- To format the template, use:

```shell
packer fmt .
```

- To validate the template, use:

```shell
# to validate syntax only
packer validate -syntax-only .
# to validate the template as a whole
packer validate .
```

- To build the custom AMI using packer, use:

```shell
packer build <filename>.pkr.hcl
```

## :arrows_clockwise: CI/CD pipelines

### Validate template

Validate the packer template when a pull request is opened. The PR status checks should fail and block merge in case the template is invalid.

### Build AMI

The AMI should be built when the PR is merged. The ami should be shared with the AWS `prod` account automatically. [This can be done by providing the AWS account ID in the packer template, [see here](https://developer.hashicorp.com/packer/plugins/builders/amazon/ebs#ami_users)].

Create the `.env` file on the fly, when unpacking artifacts! You will need to declare the environment secrets in the organization secrets, and read them during the CI/CD workflow.

## :ninja: Author

[Siddharth Rawat](mailto:rawat.sid@northeastern.edu)

## :scroll: License

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
