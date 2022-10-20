#!/usr/bin/env bash
############################################################################################
##                                   post-install.sh                                      ##
##                              Author: Siddharth Rawat                                   ##
##                             Copyright 2022 Artemis IX                                  ##
##                     This script starts the API service on the AMI                      ##
############################################################################################
#

echo "+-----------------------------------------------------------------------------------------------------------------------------------------+"
echo "|                                                                                                                                         |"
echo "|                                                        Starting the REST API service                                                    |"
echo "|                                                                                                                                         |"
echo "+-----------------------------------------------------------------------------------------------------------------------------------------+"
sudo cp /home/ubuntu/nodeserver.service /lib/systemd/system/nodeserver.service
echo "Starting the REST API Service"
sudo systemctl daemon-reload
sudo systemctl enable nodeserver
sudo systemctl start nodeserver
sudo systemctl status nodeserver
APISRVC=$?
if [ $APISRVC -eq 0 ]; then
  echo "API service is running successfully!"
else
  echo "Unable to start the API service"
fi
