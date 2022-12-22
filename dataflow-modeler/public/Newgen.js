const fs = require('fs');
const path = require('path');
let namespace = []

function readFolders(dir) {
    let list_of_dir = [];
    fs.readdirSync(dir).forEach((file) => {
        const filePath = path.join(dir, file);
        const fileStats = fs.lstatSync(filePath);
        if (fileStats.isDirectory()) {
            list_of_dir.push(file);
        }
    });
    return list_of_dir;
}

const rootDir = path.join(process.cwd(), 'dist','tosca-definitions-public/nodetypes');
let list_dir = readFolders(rootDir);
let count = 0;
for(let ns of list_dir){
    let jsonObj = {};
    const filePath = path.join(rootDir, ns);
    jsonObj['id']= `ns${count}`;
    jsonObj['name'] = decodeURIComponent(ns);
    jsonObj['type'] = readFolders(filePath);
    namespace.push(jsonObj);
    count++;
}
console.log(namespace);
let folderNamesJson = JSON.stringify({'Namespace' : namespace});
let filepath = path.join(process.cwd(), 'dist', 'NewNamespace.json');
fs.writeFile(filepath, folderNamesJson , 'utf8', (err) => {
    if (err) throw err;
    console.log('The file has been saved!');
    console.log(filepath);
});