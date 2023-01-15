FROM node:latest

# enevironment variable that has nodetype directory path
ARG DIRPATH

# install simple http server for serving static content
RUN npm install -g http-server

# make the 'app' folder the current working directory
WORKDIR /app

RUN mkdir nodetypes

# copy the content of the nodetype directory
COPY ${DIRPATH} /app/nodetypes

ADD NamespaceGenerator.sh .

# copy both 'package.json' and 'package-lock.json' (if available)
COPY dataflow-modeler/package*.json ./

# install project dependencies
RUN npm install

# copy project files and folders to the current working directory (i.e. 'app' folder)
COPY dataflow-modeler /app

# get update list
RUN apt-get update

# install jq, which is required for generating JSON objects in bash script
RUN apt-get -y install jq

RUN chmod +x NamespaceGenerator.sh

# run the bash script to generate Namespace.json
RUN bash NamespaceGenerator.sh

# build app for production with minification
RUN npm run build

# remove the nodetype directory
RUN rm -r nodetypes

EXPOSE 8080

# start the server
CMD http-server dist