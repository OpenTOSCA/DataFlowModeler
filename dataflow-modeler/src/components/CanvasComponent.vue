<template>
    <div class="col-right">
      <div class="menuClass">
        <label>Name</label>
        <input class="text-filepath" v-model="filename" placeholder="Enter the file name" type="text" style="flex: 1;font-size: 100%"><br><br>
        <div class="btn-save" v-on:click="ExportData($store.getters.GetEditor.export())">Save</div>
        <input type="file" id="test" style="display:none" accept=".xml">
        <div class="btn-export" v-on:click="selectFile">Load</div>
      </div>
      <div class="col-right-sub">
        <div id="drawflow" v-on:drop="flowEvents.drop" v-on:dragover="flowEvents.allowDrop">
          <div class="btn-clear" v-on:click="$store.getters.GetEditor.clearModuleSelected()">Clear</div>
          <div class="btn-lock" v-on:click="changeMode">
            <div v-if="lock_state"><i id="lock" class="fas fa-lock"></i></div>
            <div v-else><i id="unlock" class="fas fa-lock-open"></i></div>
          </div>
          <div class="bar-zoom">
            <div @click="$store.getters.GetEditor.zoom_out()"><i class="fas fa-search-minus"></i></div>
            <div @click="$store.getters.GetEditor.zoom_reset()" style="padding: 0 5px 0 5px"><i class="fas fa-search"></i></div>
            <div @click="$store.getters.GetEditor.zoom_in()"><i class="fas fa-search-plus"></i></div>
          </div>
        </div>
        <property-component></property-component>
      </div>
    </div>
</template>

<script>
import Drawflow from "@/assets/drawflow";
import store from "@/plugins/store";
import FlowEvents from "@/assets/flowevents";
import Helper from "@/assets/helper";
import $ from 'jquery';
import PropertyComponent from "@/components/PropertyComponent";

export default {
  name: "CanvasComponent",
  components: {PropertyComponent},
  data() {
    return{
      flowEvents: new FlowEvents(),
      helper:new Helper(),
      drawflow: new Drawflow(),
      lock_state:false,
      editor:null,
      mobileItemSelect : '',
      mobileLastMove : null,
      filename: '',
      dataToImport:{"drawflow":{"Home":{"data":{}}}},
    }
  },
  mounted() {
    this.id = document.getElementById("drawflow")
    store.commit('SetEditor',new Drawflow(this.id))
    store.getters.GetEditor.reroute = true;
    store.getters.GetEditor.reroute_fix_curvature = true;
    store.getters.GetEditor.force_first_input = false;

    store.getters.GetEditor.start();
    store.getters.GetEditor.import(this.dataToImport);

    // Events for the canvas component
    store.getters.GetEditor.on('nodeCreated', function(id) {
      console.log("Node created " + id);
    })

    store.getters.GetEditor.on('nodeRemoved', function(id) {
      console.log("Node removed " + id);
    })

    store.getters.GetEditor.on('nodeSelected', async function(node) {
      console.log("Node selected " + node.nodeId);
      store.commit('SetNodeProp',node);
    })

    store.getters.GetEditor.on('nodeUnselected', function(id) {
      console.log("Node unselected " + id);
      store.commit('SetNodeProp',null);
      $('#propTable > tbody >tr').remove();

    })

    store.getters.GetEditor.on('moduleCreated', function(name) {
      console.log("Module Created " + name);
    })

    store.getters.GetEditor.on('moduleChanged', function(name) {
      console.log("Module Changed " + name);
    })

    store.getters.GetEditor.on('connectionCreated', function(connection) {
      console.log('Connection created');
      console.log(connection);
    })

    store.getters.GetEditor.on('connectionSelected', function(pipe) {
      console.log('Connection selected');
      store.commit('SetPipeProp',pipe);
      console.log(pipe.type);
    })

    store.getters.GetEditor.on('connectionUnselected', function(connection) {
      console.log('Connection unselected');
      store.commit('SetPipeProp',null);
      console.log(connection);
    })

    store.getters.GetEditor.on('connectionRemoved', function(connection) {
      console.log('Connection removed');
      console.log(connection);
    })
    store.getters.GetEditor.on('nodeMoved', function(id) {
      console.log("Node moved " + id);
    })

    store.getters.GetEditor.on('zoom', function(zoom) {
      console.log('Zoom level ' + zoom);
    })

    store.getters.GetEditor.on('translate', function(position) {
      console.log('Translate x:' + position.x + ' y:'+ position.y);
    })

    store.getters.GetEditor.on('addReroute', function(id) {
      console.log("Reroute added " + id);
    })

    store.getters.GetEditor.on('removeReroute', function(id) {
      console.log("Reroute removed " + id);
    })

    let elements = document.getElementsByClassName('drag-drawflow');
    for (let i = 0; i < elements.length; i++) {
      elements[i].addEventListener('touchend', this.flowEvents.drop, false);
      elements[i].addEventListener('touchmove', this.flowEvents.positionMobile, false);
      elements[i].addEventListener('touchstart', this.flowEvents.drag, false );
    }
    let fileInput = document.getElementById('test');
    fileInput.onchange = async() => {
      const selectedFile=fileInput.files[0];
      this.filename=selectedFile.name;
      const fileContent = await selectedFile.text();
      let parser = new DOMParser();
      let dataToImport=  store.getters.GetEditor.convertXmlToJSON(parser.parseFromString(fileContent,"application/xml"));
      store.getters.GetEditor.import(dataToImport);
    }

  },
  methods: {
    // To select file from the explorer
    selectFile(){
      let file=document.getElementById("test");
      file.click();

    },

    // To change the editing mode of the canvas
    changeMode() {
      if(this.lock_state) {
        this.lock_state = false;
        store.getters.GetEditor.editor_mode = 'edit';
      } else {
        this.lock_state = true;
        store.getters.GetEditor.editor_mode = 'fixed';
      }
    },

    // To export the data to XML format
    ExportData(data){
      if(this.filename!=""){
        //let xmlData = this.helper.OBJtoXML(data);
        let a = document.createElement("a");
        let file = new Blob([data], {type: "application/xml;charset=utf-8"});
        a.href = URL.createObjectURL(file);
        a.download = this.filename+'.xml';
        a.click();
      }
      else{
        alert("Please enter the file name !!")
      }
    }
  }
}
</script>

<style scoped>

</style>
