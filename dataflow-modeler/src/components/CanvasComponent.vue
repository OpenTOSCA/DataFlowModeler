eslint-disable
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
<!--          <div class="btn-lock">-->
<!--            <i id="lock" class="fas fa-lock" v-on:click="changeMode('lock');"></i>-->
<!--            <i id="unlock" class="fas fa-lock-open" v-on:click="changeMode('unlock');" style="display:none;"></i>-->
<!--          </div>-->
<!--          <div class="bar-zoom">-->
<!--            <i class="fas fa-search-minus" v-on:click="$store.getters.GetEditor.zoom_out()"></i>-->
<!--            <i class="fas fa-search" v-on:click="$store.getters.GetEditor.zoom_reset()"></i>-->
<!--            <i class="fas fa-search-plus" v-on:click="$store.getters.GetEditor.zoom_in()"></i>-->
<!--          </div>-->
        </div>
        <div class="drawflow-property">
          <p><b>Properties</b></p>
          <button v-if="node!=null" v-on:click="saveProperty" class="btn-save" style="padding:10px; margin-bottom: 5px;text-align: right">Save</button>
          <form class="form-container" style="width: 250px">
            <div v-if="node!=null">
                <input type="hidden" class="input-name" placeholder="Enter name" name="nodeId" :value="node.nodeId">
                <label>Name</label>
                <span>&nbsp;</span>
                <input type="text" class="input-name" placeholder="Enter name" name="nodeName" :value="node.name">
              <table v-if="options!=null && providers!=null">
                <tr>
                  <td>Namespace</td>
                  <td>
                    <select name="namespace" v-model="node.namespace" style="width: 100%">
                      <option v-for="ns in options.Namespace" :key="ns">{{ns.name}}</option>
                    </select>
                  </td>
                </tr>
                <tr>
                  <td>Type</td>
                  <td>
                    <select name="type" v-model="node.type" style="width: 100%">
                      <option v-for="type in Types" :key="type">{{type}}</option>
                    </select>
                  </td>
                </tr>
                <tr>
                  <td>Provider</td>
                  <td>
                    <select name="provider" v-model="node.provider" style="width: 100%">
                      <option v-for="provider in providers.Provider" :key="provider">{{provider.name}}</option>
                    </select>
                  </td>
                </tr>
                <tr>
                  <td>Location</td>
                  <td>
                    <select name="location" v-model="node.location" style="width: 100%">
                      <option v-for="location in Location" :key="location">{{location}}</option>
                    </select>
                  </td>
                </tr>
              </table>
            </div>
            <table id="propTable" style="width: 250px;">
              <thead class="propTable-header" v-if="node!=null">
              <tr>
                <th>
                  <label><b>Key</b></label>
                </th>
                <th>
                  <label><b>Value</b></label>
                </th>
              </tr>
              </thead>
              <tbody class="propTable-body" :data-node="node.nodeId" v-if="node!=null">
              <template v-for="prop in node.properties" :key="prop">
                <tr :name="prop.key">
                  <td><input type="text" class="input-field" placeholder="Enter Key" name="key" :value="prop.key" @change="updateRow"></td>
                  <td><input type="text" class="input-field" placeholder="Enter Value" name="value" :value="prop.value" @change="updateRow"></td>
                  <td><button class="btn-propdelete" @click="deleteRow">x</button></td>
                </tr>
              </template>
              </tbody>
            </table>
          </form>
          <button class="btn-prop" @click="addRow" style="width:50%;" v-if="node!=null">+</button>
        </div>
      </div>
    </div>
</template>

<script>
import Drawflow from "@/assets/drawflow";
import store from "@/plugins/store";
import FlowEvents from "@/assets/flowevents";
import Helper from "@/assets/helper";
import $ from 'jquery';

export default {
  name: "CanvasComponent",
  data() {
    return{
      flowEvents: new FlowEvents(),
      helper:new Helper(),
      drawflow: new Drawflow(),
      editor:null,
      mobileItemSelect : '',
      mobileLastMove : null,
      filename: '',
      selectedNamespace:'',
      Types:[],
      selectedType:'',
      selectedProvider:'',
      Location:[],
      selectedLocation:'',
      dataToImport:{"drawflow":{"Home":{"data":{}}}},
      prop:{'key':'','value':''}
    }
  },
  computed:{
    node:function(){
      return store.getters.GetNodeProp;
    },
    options:function(){
      return store.getters.GetOptions;
    },
    providers:function(){
      return store.getters.GetProviders;
    },
    // nodeId:function (){
    //   let node=store.getters.GetNodeProp;
    //   if(node!=null){
    //     return store.getters.GetNodeProp['nodeId'];
    //   }
    //   else{
    //     return null;
    //   }
    //
    // },
    // nodeProperty:function(){
    //   console.log("prop",store.getters.GetNodeProp['properties']);
    //   return store.getters.GetNodeProp['properties'];
    // }
  },
  mounted() {
    this.id = document.getElementById("drawflow")
    //store.getters.GetEditor= new Drawflow(this.id)
    store.commit('SetEditor',new Drawflow(this.id))
    store.getters.GetEditor.reroute = true;
    store.getters.GetEditor.reroute_fix_curvature = true;
    store.getters.GetEditor.force_first_input = false;

    store.getters.GetEditor.start();
    store.getters.GetEditor.import(this.dataToImport);
    // Events!
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

    store.getters.GetEditor.on('connectionRemoved', function(connection) {
      console.log('Connection removed');
      console.log(connection);
    })
    /*
        editor.on('mouseMove', function(position) {
          console.log('Position mouse x:' + position.x + ' y:'+ position.y);
        })
    */
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

    // $('.propTable-body').on('click', '.btn-propdelete', function(e){
    //   e.target.closest("tr").remove();
    // });

    // $('.propTable-body').on('blur','.input-field',function (){
    //   // let element=e.target.closest("input[name='value']");
    //   console.log("node id:",$('#propTable > tbody').data("node"));
    //   console.log($(this).closest('input[name="value"]').attr('name'));
    //   store.getters.GetEditor.addProperties($('#propTable > tbody').data("node"),$(this).attr('name'),$(this).val());
    //   // store.getters.GetEditor.updateNodeProperty(e,{'key':e.target.value});
    //   // alert(e.target.innerText);
    // });



  },
  methods: {
    selectFile(){
      let file=document.getElementById("test");
      file.click();

    },
    changeMode(option) {
      console.log(option);
      let lock=document.getElementById("lock")
      let unlock=document.getElementById("unlock")
      console.log(lock,unlock)
      if(option == 'lock') {
        lock.style.display = 'none';
        unlock.style.display = 'block';
      } else {
        lock.style.display = 'block';
        unlock.style.display = 'none';
      }
    },
    ExportData(data){
      if(this.filename!=""){
        //let xmlData = this.helper.OBJtoXML(data);
        let a = document.createElement("a");
        let file = new Blob([data], {type: "application/xml;charset=utf-8"});
        a.href = URL.createObjectURL(file);
        a.download = this.filename;
        a.click();
      }
      else{
        alert("Please enter the file name !!")
      }
    },
    addRow(){
      //$('#propTable > tbody').append(this.newRow);
      console.log(this.node.properties[this.node.properties.length-1]);
      this.node.properties.push(this.prop);

    },
    updateRow(event){
      let key=event.target.closest("tr").cells[0].children[0].value;
      let value=event.target.closest("tr").cells[1].children[0].value;
      this.node.properties[this.node.properties.length-1]={'key':key,'value':value};
    },
    deleteRow(event){
      event.target.closest("tr").remove();
    },
    saveProperty() {
      let formData= $('form').serializeArray();
      //console.log('Id save prop:'+$('#propTable > tbody').data("node"));
      store.getters.GetEditor.addNodeProperties(formData);
    },
    changeNameSpace(){
      this.Types= (this.options.Namespace.filter((ns)=> ns.name=== this.node.namespace))[0].type;
    },
    changeProvider(){
      this.Location= (this.providers.Provider.filter((ps)=> ps.name=== this.node.provider))[0].location;
    }

  },
  watch:{
    'node.namespace':function(val){
      if(val){
        this.changeNameSpace();
      }
    },
    'node.provider':function(val){
      if(val){
        this.changeProvider();
      }
    }
  }
}
</script>

<style scoped>

</style>