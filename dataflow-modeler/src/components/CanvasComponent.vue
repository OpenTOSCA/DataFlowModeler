/* eslint-disable */
<template>
    <div class="col-right">
      <div class="menuClass">
        <label>Name</label>
        <input class="text-filepath" v-model="filename" placeholder="Enter the file name" type="text" style="flex: 1;font-size: 100%"><br><br>
        <div class="btn-save" v-on:click="ExportData(JSON.stringify($store.getters.GetEditor.export(), null,4))">Save</div>
        <input type="file" id="test" style="display:none" accept=".txt">
        <div class="btn-export" v-on:click="selectFile">Load</div>
      </div>
      <div class="col-right-sub">
        <div id="drawflow" v-on:drop="flowEvents.drop" v-on:dragover="flowEvents.allowDrop">
          <div class="btn-clear" v-on:click="$store.getters.GetEditor.clearModuleSelected()">Clear</div>
          <!--        <div class="btn-lock" @click="alert('hi')">-->
          <!--          <i id="lock" class="fas fa-lock"></i>-->
          <!--&lt;!&ndash;          <i id="unlock" class="fas fa-lock-open" v-on:click="changeMode('unlock');"&ndash;&gt;-->
          <!--&lt;!&ndash;             style="display:none;"></i>&ndash;&gt;-->
          <!--        </div>-->
          <!--        <div class="bar-zoom">-->
          <!--          <i class="fas fa-search-minus" v-on:click="$store.getters.GetEditor.zoom_out()"></i>-->
          <!--          <i class="fas fa-search" v-on:click="$store.getters.GetEditor.zoom_reset()"></i>-->
          <!--          <i class="fas fa-search-plus" v-on:click="$store.getters.GetEditor.zoom_in()"></i>-->
          <!--        </div>-->
        </div>
        <div class="drawflow-property" >
          <p><b>Properties</b></p>
          <div class="form-container">
            <table id="propTable" style="width: 250px;">
              <thead class="propTable-header">
              <tr>
                <th>
                  <label><b>Key</b></label>
                </th>
                <th>
                  <label><b>Value</b></label>
                </th>
              </tr>
              </thead>
              <tbody class="propTable-body">
<!--              <tr>-->
<!--                <td>-->
<!--                  <input type="text" placeholder="Enter Key" name="key">-->
<!--                </td>-->
<!--                <td>-->
<!--                  <input type="text" placeholder="Enter Value" name="value">-->
<!--                </td>-->
<!--                <td>-->
<!--                  <button class="btn-delete" data-val="row-1" @click="deleteRow">x</button>-->
<!--                </td>-->
<!--              </tr>-->
              </tbody>
              <tfoot style="text-align: center">

              </tfoot>
            </table>
          </div>
          <button class="btn-prop" @click="addRow" style="width:50%;">+</button>
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
      id: null,
      editor:null,
      mobileItemSelect : '',
      mobileLastMove : null,
      filename: '',
      // dataToImport : {"drawflow":{"Home":{"data":{"4":{"id":4,"name":"email","data":{},"class":"email","html":"\n<div>\n<div class=\"title-box\"><i class=\"fas fa-at\"></i> Send Email </div>\n</div>\n", "typenode": false, "inputs":{"input_1":{"connections":[{"node":"5","input":"output_1"}]}},"outputs":{},"property":{"properties":[{"key":"test1","value":"10"},{"key":"test1","value":"10"}]},"pos_x":1033,"pos_y":439},"5":{"id":5,"name":"template","data":{"template":"Write your template"},"class":"template","html":"\n<div>\n<div class=\"title-box\"><i class=\"fas fa-code\"></i> Template</div>\n<div class=\"box\">\nGer Vars\n <textarea df-template></textarea>\nOutput template with vars\n </div>\n       </div>\n", "typenode": false, "inputs":{"input_1":{"connections":[{"node":"6","input":"output_1"}]}},"outputs":{"output_1":{"connections":[{"node":"4","output":"input_1"},{"node":"11","output":"input_1"}]}},"property":{"properties":[{"key":"test1","value":"10"},{"key":"test1","value":"10"}]},"pos_x":607,"pos_y":304},"6":{"id":6,"name":"github","data":{"name":"https://github.com/jerosoler/Drawflow"},"class":"github","html":"\n<div>\n <div class=\"title-box\"><i class=\"fab fa-github \"></i> Github Stars</div>\n      <div class=\"box\">\n<p>Enter repository url</p>\n<input type=\"text\" df-name>\n</div>\n</div>\n", "typenode": false, "inputs":{},"outputs":{"output_1":{"connections":[{"node":"5","output":"input_1"}]}},"property":{"properties":[{"key":"test1","value":"10"},{"key":"test1","value":"10"}]},"pos_x":341,"pos_y":191}}}}}
      dataToImport:{"drawflow":{"Home":{"data":{}}}},
      newRow:'<tr><td><input type="text" class="input-field"' +
          ' placeholder="Enter Key" name="key">\n' +
          '                  </td>\n' +
          '                  <td>\n' +
          '                    <input type="text" class="input-field" placeholder="Enter Value" name="value">\n' +
          '                  </td>\n' +
          '                  <td>\n' +
          '                    <button class="btn-propdelete">x</button>\n' +
          '                  </td></tr>'
    }
  },
  mounted() {
    this.id = document.getElementById("drawflow")
    //store.getters.GetEditor= new Drawflow(this.id)
    store.commit('SetEditor',new Drawflow(this.id))
    store.getters.GetEditor.reroute = true;
    store.getters.GetEditor.reroute_fix_curvature = true;
    store.getters.GetEditor.force_first_input = false;
    console.log(store.getters.GetEditor)

    store.getters.GetEditor.start();
    store.getters.GetEditor.import(this.dataToImport);
    // Events!
    store.getters.GetEditor.on('nodeCreated', function(id) {
      console.log("Node created " + id);
    })

    store.getters.GetEditor.on('nodeRemoved', function(id) {
      console.log("Node removed " + id);
    })

    store.getters.GetEditor.on('nodeSelected', function(properties) {
      console.log("Node selected " + properties);
      properties.forEach(function(item){
        console.log(item.key);
        $('#propTable > tbody >tr').remove();
        $('#propTable > tbody').append(
            `<tr><td><input type="text" class="input-field" placeholder="Enter Key" name="key" value="${item.key}"></td>` +
            `<td><input type="text" class="input-field" placeholder="Enter Value" name="value" value="${item.value}"></td>` +
            `<td><button class="btn-propdelete">x</button></td></tr>`);
      })
    })

    store.getters.GetEditor.on('nodeUnselected', function(id) {
      console.log("Node unselected " + id);
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
      this.dataToImport= JSON.parse(fileContent);
      store.getters.GetEditor.import(this.dataToImport);
      // const selectedFiles = [...fileInput.files];
      // for (const f of selectedFiles) {
      //   console.log(f);
      // }
    }

    $('.propTable-body').on('click', '.btn-propdelete', function(e){
      e.target.closest("tr").remove();
    });

    $('.propTable-body').on('blur','.input-field',function (e){
      // console.log(e.target.closest("input[name='key']"));
      console.log(e.target.closest("input[name='value']"));
      // store.getters.GetEditor.updateNodeProperty(e,{'key':e.target.value});
      // alert(e.target.innerText);
    })
  },
  methods: {
    selectFile(){
      let file=document.getElementById("test");
      file.click();
      // if(document.getElementById("test").value != ""){
      //   // do stuff here
      //   let files = document.getElementById("test")[0].files;
      //   console.log(files);
      // }

    },
    changeMode(option) {
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
        let xmlData = this.helper.OBJtoXML(data);
        console.log(xmlData);
        let a = document.createElement("a");
        let file = new Blob([data], {type: "text/plain;charset=utf-8"});
        a.href = URL.createObjectURL(file);
        a.download = this.filename;
        a.click();
      }
      else{
        alert("Please enter the file name !!")
      }
    },
    addRow(){
      $('#propTable > tbody').append(this.newRow);

    },
    deleteRow(e){
      e.target.closest("tr").remove();
    }
  }
}
</script>

<style scoped>

</style>