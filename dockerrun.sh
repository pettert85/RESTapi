#!/bin/bash

#A docker run command to remove containers ability to run KILL command. 
#--rm is added in order to remove and clean up the filesystem after the contianer is closed
#The best would be to run --cap-drop ALL and --cap-add "Needed capabilities"

#gcc flaskehals.c -o flaskehals -static
docker build -t $1/nodeserver .
docker run -v database:/database/ -p 8888:8888 --rm --name nodeserver -it $1/nodeserver /bin/sh
