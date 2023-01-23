# DataFlow web editor
A flow library based web editor

## Steps to build docker image

1. Build the base image "dataflow-editor-base" by running the below command in the project directory
   ```
   docker-compose build
   ```
2. From the **_repository_files_** folder in the project directory, copy files to the repository folder
3. Set the folder path to the environment variable in the file ".env" 
    ```
   DIRPATH=nodetypes
   ```
4. Build a new docker image which will use the previous build image as its base,<br /> 
   Use docker compose 
   ```
   docker-compose build
   ```
   To build image and run the container 
   ```
   docker-compose up
   ```
## Endpoint
   To run on the local host
   ```
   docker run -it -p 8080:8080 dataflow-editor:latest
   ```
   To run from the build context
   ```
   docker-compose up
   ```

## References
<a id="1">[1]</a>
**Drawflow** by jerosoler. [link](https://github.com/jerosoler/Drawflow)
