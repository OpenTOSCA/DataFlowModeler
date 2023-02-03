FROM node:latest

# make the 'app' folder the current working directory
WORKDIR /app

# add the json generation script
ADD NamespaceGenerator.sh .

# copy both 'package.json' and 'package-lock.json' (if available)
COPY dataflow-modeler/package*.json ./

# install project dependencies
RUN npm install

# copy project files and folders to the current working directory (i.e. 'app' folder)
COPY dataflow-modeler /app