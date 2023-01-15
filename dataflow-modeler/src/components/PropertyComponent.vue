<template>
  <div class="col-prop">
    <div class="drawflow-property" style="overflow: scroll;height: 100%">
      <p><b>Properties</b></p>
      <button class="btn-save-prop" v-if="node!=null || pipe!=null" v-on:click="saveProperty">Save</button>
      <form class="form-container" style="width: 250px">
        <div v-if="node!=null">
          <input type="hidden" class="input-name" placeholder="Enter name" name="formType" value="nodeform">
          <input type="hidden" class="input-name" placeholder="Enter name" name="nodeId" :value="node.nodeId">
          <label>Name</label>
          <span>&nbsp;</span>
          <input type="text" class="input-name" placeholder="Enter name" name="nodeName" :value="node.name">
          <table v-if="options!=null && providers!=null">
            <tr>
              <td>Namespace</td>
              <td>
                <select name="namespace" v-model="node.namespace" style="width: 100%">
                  <option v-for="ns in options.Namespace" :key="ns" :value="ns.id">{{ns.name}}</option>
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
        <div v-if="pipe!=null">
          <input type="hidden" class="input-name" placeholder="Enter name" name="formType" value="pipeform">
          <table>
            <tr>
              <td>Data Transfer Type</td>
              <td>
                <select name="pipetype" v-model="pipe.type" style="width: 100%">
                  <option v-for="pipeType in pipeTypes" :key="pipeType">{{pipeType}}</option>
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
          <template v-for="prop in node.properties" :key="prop.key">
            <tr :name="prop.key">
              <td><input type="text" class="input-field" placeholder="Enter Key" name="key" :value="prop.key" v-on:change="updateProp($event, prop)"></td>
              <td><input type="text" class="input-field" placeholder="Enter Value" name="value" :value="prop.value" v-on:change="updateProp($event, prop)"></td>
              <td><button class="btn-propdelete" type="button" @click="deleteRow">x</button></td>
            </tr>
          </template>
          </tbody>
        </table>
      </form>
      <button class="btn-prop" @click="addRow" style="width:50%;" v-if="node!=null">+</button>
    </div>
  </div>
</template>

<script>
import store from "@/plugins/store";
import $ from "jquery";

export default {
  name: "PropertyComponent",
  data(){
    return{
      selectedNamespace:'',
      Types:[],
      pipeTypes:["push","pull"],
      selectedType:'',
      selectedProvider:'',
      Location:[],
      selectedLocation:'',
      nodeProperties:[],
      node:null
    }
  },
  computed:{
    nodeSelected:function(){
      return store.getters.GetNodeProp;
    },
    pipe:function(){
      return store.getters.GetPipeProp;
    },
    options:function(){
      return store.getters.GetNamespace;
    },
    providers:function(){
      return store.getters.GetProviders;
    }
  },
  methods:{
    // add rows to property table
    addRow(){
      this.node.properties.push({'key':'','value':''});
    },
    // delete rows from property table
    deleteRow(event){
      event.target.closest("tr").remove();
    },
    // save node or pipe properties
    saveProperty() {
      let formData= $('form').serializeArray();
      if(formData[0].name === "formType" && formData[0].value === "nodeform")
        store.getters.GetEditor.addNodeProperties(formData);
      else
        store.getters.GetEditor.addPipeProperties({'pipe':this.pipe,'data':formData});
    },
    // function to populate type according to the namespace selected
    changeNameSpace(){
      this.Types= (this.options.Namespace.filter((ns)=> ns.id === this.node.namespace))[0].type;
    },
    // function to populate location according to the provider selected
    changeProvider(){
      this.Location= (this.providers.Provider.filter((ps)=> ps.name=== this.node.provider))[0].location;
    },
    // update properties
    updateProp(event, prop){
      let index = this.node.properties.findIndex(p=> p.key === prop.key);
      if(event.target.name === 'key')
      {
        this.node.properties[index].key = event.target.value;
      }
      else{
        this.node.properties[index].value = event.target.value;
      }
    }
  },
  watch:{
    'node.namespace':function(val){
      if(val){
        console.log(val)
        this.changeNameSpace();
      }
    },
    'node.provider':function(val){
      if(val){
        this.changeProvider();
      }
    },
    'nodeSelected':function (val){
      this.node = JSON.parse(JSON.stringify(this.nodeSelected));
    }
  }
}
</script>

<style scoped>

</style>