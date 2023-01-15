FROM node:latest

ARG DIRPATH

# install simple http server for serving static content
RUN npm install -g http-server

# make the 'app' folder the current working directory
WORKDIR /app

RUN mkdir nodetypes

COPY ${DIRPATH} /app/nodetypes

ADD NamespaceGenerator.sh .

# copy both 'package.json' and 'package-lock.json' (if available)
COPY dataflow-modeler/package*.json ./

# install project dependencies
RUN npm install

# copy project files and folders to the current working directory (i.e. 'app' folder)
COPY dataflow-modeler /app

RUN apt-get update

RUN apt-get -y install jq

RUN chmod +x NamespaceGenerator.sh

RUN bash NamespaceGenerator.sh

# build app for production with minification
RUN npm run build

RUN rm -r nodetypes

EXPOSE 8080

CMD http-server dist