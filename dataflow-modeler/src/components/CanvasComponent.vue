<template>
    <div class="col-right">
      <div id="drawflow" v-on:drop="flowEvents.drop" v-on:dragover="flowEvents.allowDrop">
        <div class="btn-export" @click="Swal.fire({ title: 'Export',
        html: '<pre><code>'+JSON.stringify(editor.export(), null,4)+'</code></pre>'
        })">Export
        </div>
        <div class="btn-clear" @click="editor.clearModuleSelected()">Clear</div>
        <div class="btn-lock">
          <i id="lock" class="fas fa-lock" @click="editor.editor_mode='fixed'; changeMode('lock');"></i>
          <i id="unlock" class="fas fa-lock-open" @click="editor.editor_mode='edit'; changeMode('unlock');"
             style="display:none;"></i>
        </div>
        <div class="bar-zoom">
          <i class="fas fa-search-minus" @click="editor.zoom_out()"></i>
          <i class="fas fa-search" @click="editor.zoom_reset()"></i>
          <i class="fas fa-search-plus" @click="editor.zoom_in()"></i>
        </div>
      </div>
    </div>
</template>

<script>
import Drawflow from "@/assets/drawflow";
import store from "@/plugins/store";
import FlowEvents from "@/assets/flowevents";

export default {
  name: "CanvasComponent",
  data() {
    return{
      flowEvents: new FlowEvents(),
      id: null,
      editor:null,
      mobileItemSelect : '',
      mobileLastMove : null
    }
  },
  mounted() {
    this.id = document.getElementById("drawflow")
    //store.getters.GetEditor= new Drawflow(this.id)
    store.commit('SetEditor',new Drawflow(this.id))
    console.log(store.getters.GetEditor)
    const dataToImport =  {"drawflow":{"Home":{"data":{"1":{"id":1,"name":"welcome","data":{},"class":"welcome","html":"\n    <div>\n      <div class=\"title-box\">👏 Welcome!!</div>\n      <div class=\"box\">\n        <p>Simple flow library <b>demo</b>\n        <a href=\"https://github.com/jerosoler/Drawflow\" target=\"_blank\">Drawflow</a> by <b>Jero Soler</b></p><br>\n\n        <p>Multiple input / outputs<br>\n           Data sync nodes<br>\n           Import / export<br>\n           Modules support<br>\n           Simple use<br>\n           Type: Fixed or Edit<br>\n           Events: view console<br>\n           Pure Javascript<br>\n        </p>\n        <br>\n        <p><b><u>Shortkeys:</u></b></p>\n        <p>🎹 <b>Delete</b> for remove selected<br>\n        💠 Mouse Left Click == Move<br>\n        ❌ Mouse Right == Delete Option<br>\n        🔍 Ctrl + Wheel == Zoom<br>\n        📱 Mobile support<br>\n        ...</p>\n      </div>\n    </div>\n    ", "typenode": false, "inputs":{},"outputs":{},"pos_x":50,"pos_y":50},"2":{"id":2,"name":"slack","data":{},"class":"slack","html":"\n          <div>\n            <div class=\"title-box\"><i class=\"fab fa-slack\"></i> Slack chat message</div>\n          </div>\n          ", "typenode": false, "inputs":{"input_1":{"connections":[{"node":"7","input":"output_1"}]}},"outputs":{},"pos_x":1028,"pos_y":87},"3":{"id":3,"name":"telegram","data":{"channel":"channel_2"},"class":"telegram","html":"\n          <div>\n            <div class=\"title-box\"><i class=\"fab fa-telegram-plane\"></i> Telegram bot</div>\n            <div class=\"box\">\n              <p>Send to telegram</p>\n              <p>select channel</p>\n              <select df-channel>\n                <option value=\"channel_1\">Channel 1</option>\n                <option value=\"channel_2\">Channel 2</option>\n                <option value=\"channel_3\">Channel 3</option>\n                <option value=\"channel_4\">Channel 4</option>\n              </select>\n            </div>\n          </div>\n          ", "typenode": false, "inputs":{"input_1":{"connections":[{"node":"7","input":"output_1"}]}},"outputs":{},"pos_x":1032,"pos_y":184},"4":{"id":4,"name":"email","data":{},"class":"email","html":"\n            <div>\n              <div class=\"title-box\"><i class=\"fas fa-at\"></i> Send Email </div>\n            </div>\n            ", "typenode": false, "inputs":{"input_1":{"connections":[{"node":"5","input":"output_1"}]}},"outputs":{},"pos_x":1033,"pos_y":439},"5":{"id":5,"name":"template","data":{"template":"Write your template"},"class":"template","html":"\n            <div>\n              <div class=\"title-box\"><i class=\"fas fa-code\"></i> Template</div>\n              <div class=\"box\">\n                Ger Vars\n                <textarea df-template></textarea>\n                Output template with vars\n              </div>\n            </div>\n            ", "typenode": false, "inputs":{"input_1":{"connections":[{"node":"6","input":"output_1"}]}},"outputs":{"output_1":{"connections":[{"node":"4","output":"input_1"},{"node":"11","output":"input_1"}]}},"pos_x":607,"pos_y":304},"6":{"id":6,"name":"github","data":{"name":"https://github.com/jerosoler/Drawflow"},"class":"github","html":"\n          <div>\n            <div class=\"title-box\"><i class=\"fab fa-github \"></i> Github Stars</div>\n            <div class=\"box\">\n              <p>Enter repository url</p>\n            <input type=\"text\" df-name>\n            </div>\n          </div>\n          ", "typenode": false, "inputs":{},"outputs":{"output_1":{"connections":[{"node":"5","output":"input_1"}]}},"pos_x":341,"pos_y":191},"7":{"id":7,"name":"facebook","data":{},"class":"facebook","html":"\n        <div>\n          <div class=\"title-box\"><i class=\"fab fa-facebook\"></i> Facebook Message</div>\n        </div>\n        ", "typenode": false, "inputs":{},"outputs":{"output_1":{"connections":[{"node":"2","output":"input_1"},{"node":"3","output":"input_1"},{"node":"11","output":"input_1"}]}},"pos_x":347,"pos_y":87},"11":{"id":11,"name":"log","data":{},"class":"log","html":"\n            <div>\n              <div class=\"title-box\"><i class=\"fas fa-file-signature\"></i> Save log file </div>\n            </div>\n            ", "typenode": false, "inputs":{"input_1":{"connections":[{"node":"5","input":"output_1"},{"node":"7","input":"output_1"}]}},"outputs":{},"pos_x":1031,"pos_y":363}}},"Other":{"data":{"8":{"id":8,"name":"personalized","data":{},"class":"personalized","html":"\n            <div>\n              Personalized\n            </div>\n            ", "typenode": false, "inputs":{"input_1":{"connections":[{"node":"12","input":"output_1"},{"node":"12","input":"output_2"},{"node":"12","input":"output_3"},{"node":"12","input":"output_4"}]}},"outputs":{"output_1":{"connections":[{"node":"9","output":"input_1"}]}},"pos_x":764,"pos_y":227},"9":{"id":9,"name":"dbclick","data":{"name":"Hello World!!"},"class":"dbclick","html":"\n            <div>\n            <div class=\"title-box\"><i class=\"fas fa-mouse\"></i> Db Click</div>\n              <div class=\"box dbclickbox\" ondblclick=\"showpopup(event)\">\n                Db Click here\n                <div class=\"modal\" style=\"display:none\">\n                  <div class=\"modal-content\">\n                    <span class=\"close\" onclick=\"closemodal(event)\">&times;</span>\n                    Change your variable {name} !\n                    <input type=\"text\" df-name>\n                  </div>\n\n                </div>\n              </div>\n            </div>\n            ", "typenode": false, "inputs":{"input_1":{"connections":[{"node":"8","input":"output_1"}]}},"outputs":{"output_1":{"connections":[{"node":"12","output":"input_2"}]}},"pos_x":209,"pos_y":38},"12":{"id":12,"name":"multiple","data":{},"class":"multiple","html":"\n            <div>\n              <div class=\"box\">\n                Multiple!\n              </div>\n            </div>\n            ", "typenode": false, "inputs":{"input_1":{"connections":[]},"input_2":{"connections":[{"node":"9","input":"output_1"}]},"input_3":{"connections":[]}},"outputs":{"output_1":{"connections":[{"node":"8","output":"input_1"}]},"output_2":{"connections":[{"node":"8","output":"input_1"}]},"output_3":{"connections":[{"node":"8","output":"input_1"}]},"output_4":{"connections":[{"node":"8","output":"input_1"}]}},"pos_x":179,"pos_y":272}}}}}
    store.getters.GetEditor.start();
    store.getters.GetEditor.import(dataToImport);
    // Events!
    store.getters.GetEditor.on('nodeCreated', function(id) {
      console.log("Node created " + id);
    })

    store.getters.GetEditor.on('nodeRemoved', function(id) {
      console.log("Node removed " + id);
    })

    store.getters.GetEditor.on('nodeSelected', function(id) {
      console.log("Node selected " + id);
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
  },
  methods: {
    // allowDrop(ev) {
    //   ev.preventDefault();
    // },
    // drop(ev) {
    //   if (ev.type === "touchend") {
    //     let parentDrawFlow = document.elementFromPoint( this.mobileLastMove.touches[0].clientX, this.mobileLastMove.touches[0].clientY).closest("#drawflow");
    //     if(parentDrawFlow != null) {
    //       this.addNodeToDrawFlow(this.mobileItemSelect, this.mobileLastMove.touches[0].clientX, this.mobileLastMove.touches[0].clientY);
    //     }
    //     this.mobile_item_selec = '';
    //   } else {
    //     ev.preventDefault();
    //     let data = ev.dataTransfer.getData("node");
    //     this.addNodeToDrawFlow(data, ev.clientX, ev.clientY);
    //   }
    //
    // },
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
    // addNodeToDrawFlow(name, pos_x, pos_y){
    //   if(store.getters.GetEditor.editor_mode === 'fixed') {
    //     return false;
    //   }
    //   pos_x = pos_x * ( store.getters.GetEditor.precanvas.clientWidth / (store.getters.GetEditor.precanvas.clientWidth * store.getters.GetEditor.zoom)) - (store.getters.GetEditor.precanvas.getBoundingClientRect().x * ( store.getters.GetEditor.precanvas.clientWidth / (store.getters.GetEditor.precanvas.clientWidth * store.getters.GetEditor.zoom)));
    //   pos_y = pos_y * ( store.getters.GetEditor.precanvas.clientHeight / (store.getters.GetEditor.precanvas.clientHeight * store.getters.GetEditor.zoom)) - (store.getters.GetEditor.precanvas.getBoundingClientRect().y * ( store.getters.GetEditor.precanvas.clientHeight / (store.getters.GetEditor.precanvas.clientHeight * store.getters.GetEditor.zoom)));
    //
    //   switch(name){
    //     case 'input':{
    //       let input = `<div><div class="title-box"><i class="fab fa-facebook"></i> Input </div></div>`;
    //       store.getters.GetEditor.addNode('input', 0,  1, pos_x, pos_y, 'input', {}, input );
    //       break;
    //     }
    //     case 'filter':{
    //       let filter = `<div><div class="title-box"><i class="fab fa-facebook"></i> Filter </div></div>`;
    //       store.getters.GetEditor.addNode('filter', 0,  1, pos_x, pos_y, 'filter', {}, filter );
    //       break;
    //     }
    //
    //     case 'output':{
    //       let output = `<div><div class="title-box"><i class="fab fa-facebook"></i> Output </div></div>`;
    //       store.getters.GetEditor.addNode('output', 0,  1, pos_x, pos_y, 'output', {}, output );
    //       break;
    //     }
    //   }
    // }
  }
}
</script>

<style scoped>

</style>