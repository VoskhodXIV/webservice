# :spider_web: webapp

[![Instance Refresh](https://github.com/ArtemisIX/webapp/actions/workflows/packer-build.yml/badge.svg)](https://github.com/ArtemisIX/webapp/actions/workflows/packer-build.yml)

RESTful Backend API service for a fullstack web application.

Demo API for reference: [Swaggerhub](https://app.swaggerhub.com/apis-docs/fall2022-csye6225/cloud-native-webapp/assignment-05)

## :package: Prerequisites

To install and run the app locally, you need to have the following installed on your local system:

- `git` (configured with ssh) [[link](https://git-scm.com/downloads)]
- `node v.16.17.0` and above [[link](https://nodejs.org/en/download/)]
- `yarn` (package manager) [[link](https://formulae.brew.sh/formula/yarn)]
- `Postman` to demo hit the APIs [[link](https://www.postman.com/downloads/)]

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

#### :ambulance: Health

<details>

- **GET** _/health_ : Get the health of the API
  - **Response:** 200 _OK_

</details>

#### :closed_lock_with_key: Authenticated Users

<details>

- **GET** _/v2/account/{accountID}_ : Get the user account information
  - **AccountID:** String (Required)
  - **Response:** 200 _OK_, **Media Type:** Application/JSON
  - **Response:** 401 _Unauthorized_
  - **Response:** 403 _Forbidden_

- **PUT** _/v2/account/{accountID}_ : Update the user's account information
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

</details>

#### :unlock: Unauthenticated Users

<details>

- `**POST** _/v2/account_ : Create a user account
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

</details>

#### :clipboard: Upload Documents

<details>

- **GET** _/v2/documents_ : Get all documents uploaded by authenticated user

  - **Response:** 200 _OK_

  ```json
    [
      {
        "doc_id": "d290f1ee-6c54-4b01-90e6-d701748f0851",
        "user_id": "d290f1ee-6c54-4b01-90e6-d701748f0851",
        "name": "string",
        "date_created": "2016-08-29T09:12:33.001Z",
        "s3_bucket_path": "string"
      }
    ]
  ```

  - **Response** 401 _Unauthorized_
  - **Response** 403 _Forbidden_

- **POST** _/v2/documents_ : Upload a document
  - **Request Body:**
    - file: _string_
    - fileType: _object_

  - **Response** 201 _File Uploaded_

    ```json
      [
        {
            "doc_id": "d290f1ee-6c54-4b01-90e6-d701748f0851",
            "user_id": "d290f1ee-6c54-4b01-90e6-d701748f0851",
            "name": "string",
            "date_created": "2016-08-29T09:12:33.001Z",
            "s3_bucket_path": "string"
        }
      ]
    ```

  - **Response** 400 _Bad Request_
  - **Response** 401 _Unauthorized_

- **GET** _/v2/account/{docID}_: Get document details for authorized user
  - **docID:** String (Required), type: UUID format
  - **Response:** 200 _OK_

  ```json
    [
      {
        "doc_id": "d290f1ee-6c54-4b01-90e6-d701748f0851",
        "user_id": "d290f1ee-6c54-4b01-90e6-d701748f0851",
        "name": "string",
        "date_created": "2016-08-29T09:12:33.001Z",
        "s3_bucket_path": "string"
      }
    ]
  ```

  - **Response** 401 _Unauthorized_
  - **Response** 403 _Forbidden_

- **DELETE** _/v2/account/{docID}_: Delete the document for authorized user
  - **docID:** String (Required), type: UUID format
  - **Response:** 204 _No Content_
  - **Response** 401 _Unauthorized_
  - **Response** 403 _Forbidden_

</details>

#### Schemas

`Account`

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
    verified: boolean
    account_created: string($date-time)
      example: 2016-08-29T09:12:33.001Z
      readOnly: true
    account_updated: string($date-time)
      example: 2016-08-29T09:12:33.001Z
      readOnly: true
  }
```

`Document`

```text
  {
    doc_id: string($uuid)
      example: d290f1ee-6c54-4b01-90e6-d701748f0851
      readOnly: true
    user_id: string($uuid)
      example: d290f1ee-6c54-4b01-90e6-d701748f0851
      readOnly: true
    name: string
      readOnly: true
    date_created: string($datetime)
      example: 2016-08-29T09:12:33.001Z
      readOnly: true
    s3_bucket_path: string
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

- To perform load testing, we will use [siege](https://www.joedog.org/siege-home/), which is a HTTP regression testing and benchmarking utility.

Install siege on mac:

```shell
brew install siege
```

Check your `siege` config by running the following command:

```shell
siege -C
```

To perform load testing, use the following command:

```shell
./scripts/smoke-test.sh
```

Once you run the above command, you see an output similar to the one shown below:

```text
** SIEGE 4.1.1
** Preparing 3 concurrent users for battle.
The server is now under siege...
HTTP/1.1 200     0.07 secs:       2 bytes ==> GET  /health
HTTP/1.1 200     0.07 secs:       2 bytes ==> GET  /health
...
HTTP/1.1 200     0.07 secs:       2 bytes ==> GET  /health
HTTP/1.1 200     0.07 secs:       2 bytes ==> GET  /health
HTTP/1.1 200     0.06 secs:       2 bytes ==> GET  /health

Transactions:                   3000 hits
Availability:                 100.00 %
Elapsed time:                 121.31 secs
Data transferred:               0.01 MB
Response time:                  0.07 secs
Transaction rate:              24.73 trans/sec
Throughput:                     0.00 MB/sec
Concurrency:                    1.66
Successful transactions:        3000
Failed transactions:               0
Longest transaction:            0.59
Shortest transaction:           0.06
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
packer validate -evaluate-datasources .
```

- To build the custom AMI using packer, use:

```shell
packer build <filename>.pkr.hcl
```

#### Packer HCL Variables

To prevent pushing sensitive details to your version control, we can have variables in the `<file-name>.pkr.hcl` file, and then declare the actual values for these variables in another HCL file with the extension `.pkrvars.hcl`.

If you want to validate your build configuration, you can use the following command:

```shell
packer validate -evaluate-datasources --var-file=<variables-file>.pkrvars.hcl <build-config>.pkr.hcl
```

> NOTE: To use the `-evaluate-datasources` parameter, you'll have to update packer to `v1.8.5` or greater. For more details, refer [this issue](https://github.com/hashicorp/packer/issues/12056).

To use this variables files when creating a golden image, use the build command as shown:

```shell
packer build --var-file=<variables-file>.pkrvars.hcl <build-config>.pkr.hcl
```

> NOTE: Using variables is the preferred way/best practice to build a custom AMI using HCP Packer!

#### [systemd](https://systemd.io/)

`systemd` is a suite of basic building blocks for a Linux system. It provides a system and service manager that runs as PID 1 and starts the rest of the system.. This will help us bootstrap our application and have it in a running state when we launch our custom AMI EC2 instance using the CloudFormation stack.

For a detailed example, please refer [this ShellHacks blog](https://www.shellhacks.com/systemd-service-file-example/).

## :arrows_clockwise: CI/CD pipelines

### Unit tests

This CI pipeline must run before changes are merged via a PR to the upstream master branch. Once the unit tests pass, the CI pipeline should check the validity of the packer build configuration.

### Validate template

This CI pipeline will validate the packer build template when a pull request is opened. The PR status checks should fail and block merge in case the template is invalid.

### Build AMI

This is the CD pipeline for our organization.

The AMI should be built when the PR is merged. The ami should be shared with the AWS `prod` account automatically. [This can be done by providing the AWS account ID in the packer template, [see here](https://developer.hashicorp.com/packer/plugins/builders/amazon/ebs#ami_users)].

Create the `.env` file on the fly, when unpacking artifacts! You will need to declare the environment secrets in the organization secrets, and read them during the CI/CD workflow.

After the AMI is built, we will create a new version of the launch template and update the original launch template. With this latest version of the launch template, we will issue an `instance-refresh` command that will update the instances running in our CloudFormation stack to use the latest version of the launch template.

Using the `instance-refresh` approach, we are just replacing the golden image in our app infra where instances using an older golden image are sacked, and new instances are launched using the latest golden image(AMI).

## :warning: IMPORTANT

To test the application locally, you will need to create a `.env` file using the `.env.example` dotenv configuration as a reference.

To create an AWS AMI using packer locally, you'll have to create a new file with the `.pkrvars.hcl` extension. You can refer the `template.pkrvars.hcl.example` as a template example.

## :ninja: Author

[Siddharth Rawat](mailto:rawat.sid@northeastern.edu)

## :scroll: License

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
