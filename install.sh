#!/bin/bash
############################################################################################
##                                    install.sh                                          ##
##                              Author: Siddharth Rawat                                   ##
##                             Copyright 2022 Artemis IX                                  ##
##                  This script installs all the dependencies on the AMI                  ##
## 1. Upgrade the OS packages.                                                            ##
## 2. Install all the application prerequisites, middleware, and runtime.                 ##
## 3. Install PostgreSQL and setup the database.                                          ##
## 4. Update permission and file ownership on the copied application artifacts.           ##
## 5. Start the REST API service                                                          ##
############################################################################################

echo "+-----------------------------------------------------------------------------------------------------------------------------------------+"
echo "|                                                                                                                                         |"
echo "|                                                           INSTALL SCRIPT v1.0                                                           |"
echo "|                                                                                                                                         |"
echo "+-----------------------------------------------------------------------------------------------------------------------------------------+"

# Install zip and unnzip
echo "+-----------------------------------------------------------------------------------------------------------------------------------------+"
echo "|                                                                                                                                         |"
echo "|                                                         Installing zip and unzip                                                        |"
echo "|                                                                                                                                         |"
echo "+-----------------------------------------------------------------------------------------------------------------------------------------+"
sudo apt-get install zip -y
sudo apt-get install unzip -y

# Install NodeJS
echo "+-----------------------------------------------------------------------------------------------------------------------------------------+"
echo "|                                                                                                                                         |"
echo "|                                                         Installing NodeJS v16.x                                                         |"
echo "|                                                                                                                                         |"
echo "+-----------------------------------------------------------------------------------------------------------------------------------------+"
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash - &&
  sudo apt-get install -y nodejs

# Install NPM
echo "+-----------------------------------------------------------------------------------------------------------------------------------------+"
echo "|                                                                                                                                         |"
echo "|                                                              Installing NPM                                                             |"
echo "|                                                                                                                                         |"
echo "+-----------------------------------------------------------------------------------------------------------------------------------------+"
sudo apt-get install npm -y

# Install Yarn
echo "+-----------------------------------------------------------------------------------------------------------------------------------------+"
echo "|                                                                                                                                         |"
echo "|                                                      Installing Yarn Package Manager                                                    |"
echo "|                                                                                                                                         |"
echo "+-----------------------------------------------------------------------------------------------------------------------------------------+"
curl -sL https://dl.yarnpkg.com/debian/pubkey.gpg | gpg --dearmor | sudo tee /usr/share/keyrings/yarnkey.gpg >/dev/null
echo "deb [signed-by=/usr/share/keyrings/yarnkey.gpg] https://dl.yarnpkg.com/debian stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
sudo apt-get update && sudo apt-get install yarn -y

# https://gist.github.com/ankurk91/240c355b988eb3d682d3e35f13ecb14b
# PostgreSQL
echo "+-----------------------------------------------------------------------------------------------------------------------------------------+"
echo "|                                                          DATABASE OPERATIONS                                                            |"
echo "+-----------------------------------------------------------------------------------------------------------------------------------------+"
echo "|                                                                                                                                         |"
echo "|                                                         Installing PostgreSQL                                                           |"
echo "|                                                                                                                                         |"
echo "+-----------------------------------------------------------------------------------------------------------------------------------------+"
sudo apt-get install postgresql postgresql-contrib -y
sleep 3
echo "+-----------------------------------------------------------------------------------------------------------------------------------------+"
echo "|                                                                                                                                         |"
echo "|                                                     Starting the PostgreSQL service                                                     |"
echo "|                                                                                                                                         |"
echo "+-----------------------------------------------------------------------------------------------------------------------------------------+"
sudo systemctl start postgresql.service
PSQLSRVC=$?
if [ $PSQLSRVC -eq 0 ]; then
  echo "Successfully started the PostgreSQL Service"
else
  echo "Unable to start the PostgreSQL Service"
fi
echo "+-----------------------------------------------------------------------------------------------------------------------------------------+"
echo "|                                                                                                                                         |"
echo "|                                                     Boostrapping PostgreSQL database                                                    |"
echo "|                                                                                                                                         |"
echo "+-----------------------------------------------------------------------------------------------------------------------------------------+"
sudo su postgres <<EOF
createdb test;
psql -c "CREATE ROLE me WITH LOGIN PASSWORD 'password';"
EOF
BOOTPSQL=$?
if [ $BOOTPSQL -eq 0 ]; then
  echo "Postgres User 'me' and database 'test' created successfully!"
else
  echo "Unable to Boostrap the PostgreSQL database"
fi

echo "+-----------------------------------------------------------------------------------------------------------------------------------------+"
echo "|                                                                                                                                         |"
echo "|                                                   Validating Installed Package Versions                                                 |"
echo "|                                                                                                                                         |"
echo "+-----------------------------------------------------------------------------------------------------------------------------------------+"
echo "node $(node --version)"
echo "npm $(npm --version)"
echo "yarn $(yarn --version)"
psql --version

echo "+-----------------------------------------------------------------------------------------------------------------------------------------+"
echo "|                                                                                                                                         |"
echo "|                                                          Validating Binaries                                                            |"
echo "|                                                                                                                                         |"
echo "+-----------------------------------------------------------------------------------------------------------------------------------------+"
which node
which npm
which yarn
which psql

echo "+-----------------------------------------------------------------------------------------------------------------------------------------+"
echo "|                                                                                                                                         |"
echo "|                                                            Unpacking Artifacts                                                          |"
echo "|                                                                                                                                         |"
echo "+-----------------------------------------------------------------------------------------------------------------------------------------+"
unzip /home/ubuntu/webapp.zip -d /home/ubuntu/webapp
sleep 3
sudo rm -rf /home/ubuntu/webapp.zip
sleep 3
echo "+-----------------------------------------------------------------------------------------------------------------------------------------+"
echo "|                                                                                                                                         |"
echo "|                                               Installing app dependencies & running unit tests                                          |"
echo "|                                                                                                                                         |"
echo "+-----------------------------------------------------------------------------------------------------------------------------------------+"
# cat .env | while read line; do
#   export $line
# done
cd webapp && yarn && yarn test
sudo cp ~/webapp/nodeserver.service /lib/systemd/system/nodeserver.service

# echo "+-----------------------------------------------------------------------------------------------------------------------------------------+"
# echo "|                                                                                                                                         |"
# echo "|                                                        Starting the REST API service                                                    |"
# echo "|                                                                                                                                         |"
# echo "+-----------------------------------------------------------------------------------------------------------------------------------------+"
