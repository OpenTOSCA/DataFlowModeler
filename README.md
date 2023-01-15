# DataFlow web editor
A flow library based web editor

## Steps to build docker image

1. Move the folder to tosca-definitions-public to the location where docker-compose.yml is present
2. Set the below environment variable in the file ".env" 
    ```
   DIRPATH=tosca-definitions-public-master/nodetypes
   ```
3. To build only the docker image, use docker compose 
   ```
   docker-compose build
   ```
4. To build image and run the container 
   ```
   docker-compose up
   ```


## References
<a id="1">[1]</a>
**Drawflow** by jerosoler. [link](https://github.com/jerosoler/Drawflow)
