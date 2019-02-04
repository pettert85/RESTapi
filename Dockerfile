#Our build

FROM node:6
EXPOSE 8888
WORKDIR /database/
RUN apt-get update && apt-get install vim -y
RUN npm install express sqlite3 xmlbuilder body-parser body-parser-xml deasync --save

#CMD [ "npm", "start" ]

