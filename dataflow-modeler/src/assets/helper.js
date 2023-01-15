import store from "@/plugins/store";
export default class Helper{
    /**
     * Function to add node data to drawflow object**/
    addNodeToDrawFlow(name, pos_x, pos_y){
        if(store.getters.GetEditor.editor_mode === 'fixed') {
            return false;
        }
        pos_x = pos_x * ( store.getters.GetEditor.precanvas.clientWidth / (store.getters.GetEditor.precanvas.clientWidth * store.getters.GetEditor.zoom)) - (store.getters.GetEditor.precanvas.getBoundingClientRect().x * ( store.getters.GetEditor.precanvas.clientWidth / (store.getters.GetEditor.precanvas.clientWidth * store.getters.GetEditor.zoom)));
        pos_y = pos_y * ( store.getters.GetEditor.precanvas.clientHeight / (store.getters.GetEditor.precanvas.clientHeight * store.getters.GetEditor.zoom)) - (store.getters.GetEditor.precanvas.getBoundingClientRect().y * ( store.getters.GetEditor.precanvas.clientHeight / (store.getters.GetEditor.precanvas.clientHeight * store.getters.GetEditor.zoom)));

        switch(name){
            case 'input':{
                // let input = `<div class="title-box">Input ${0}</div>`;
                // let input = `Input`;
                store.getters.GetEditor.addNode('input', 0,  1, pos_x, pos_y, 'input', {}, name );
                break;
            }
            case 'filter':{
                // let filter = `<div class="title-box">Filter</div>`;
                store.getters.GetEditor.addNode('filter', 1,  1, pos_x, pos_y, 'filter', {}, name );
                break;
            }

            case 'output':{
                // let output = `<div class="title-box">Output</div>`;
                store.getters.GetEditor.addNode('output', 1,  0, pos_x, pos_y, 'output', {}, name );
                break;
            }
        }
    }

    OBJtoXML(obj) {
        let xml = '';
        for (let prop in obj) {
            xml += obj[prop] instanceof Array ? '' : "<" + prop + ">";
            if (obj[prop] instanceof Array) {
                for (let array in obj[prop]) {
                    xml += "<" + prop + ">";
                    xml += this.OBJtoXML(new Object(obj[prop][array]));
                    xml += "</" + prop + ">";
                }
            } else if (typeof obj[prop] == "object") {
                xml += this.OBJtoXML(new Object(obj[prop]));
            } else {
                xml += obj[prop];
            }
            xml += obj[prop] instanceof Array ? '' : "</" + prop + ">";
        }
        xml = xml.replace(/<\/?[0-9]{1,}>/g, '');
        return xml
    }

}