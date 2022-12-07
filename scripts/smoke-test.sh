#!/bin/bash
############################################################################################
##                                     smoke-test.sh                                      ##
##                              Author: Siddharth Rawat                                   ##
##                             Copyright 2022 Artemis IX                                  ##
##                       This script performs REST API load testing                       ##
##                    [Siege FOSS is required to perform load testing]                    ##
############################################################################################

touch smoke-links.txt
echo "https://prod.sydrawat.me/" >>smoke-links.txt
echo "https://prod.sydrawat.me/healthz" >>smoke-links.txt
siege -c3 -d0.1 -r1000 -f smoke-links.txt
rm -rf smoke-links.txt
