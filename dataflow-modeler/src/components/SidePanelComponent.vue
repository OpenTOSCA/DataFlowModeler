<template>
    <div class="col">
      <h2>Palette</h2>
      <div class="toolbox">
        <div class="drag-drawflow circle" draggable="true" v-on:dragstart="flowEvents.drag" data-node="input">
          <span>Input</span>
        </div>
        <div class="drag-drawflow rectangle" draggable="true" v-on:dragstart="flowEvents.drag" data-node="filter">
          <span> Filter</span>
        </div>
        <div class="drag-drawflow circle" draggable="true" v-on:dragstart="flowEvents.drag" data-node="output">
          <span>Output</span>
        </div>
      </div>
    </div>
</template>

<script>
//import Drawflow from "@/assets/drawflow";
import FlowEvents from "@/assets/flowevents";
export default {
  name: "SidePanelComponent",
  data(){
    return{
      flowEvents: new FlowEvents(),
      // -
    }
  },
  mounted() {
    let elements = document.getElementsByClassName('drag-drawflow');
    for (let i = 0; i < elements.length; i++) {
      elements[i].addEventListener('touchend', this.flowEvents.drop, false);
      elements[i].addEventListener('touchmove', this.flowEvents.positionMobile, false);
      elements[i].addEventListener('touchstart', this.flowEvents.drag, false );
    }
  },
  methods:{
    // positionMobile(ev) {
    //   this.mobileLastMove = ev;
    //   },
    // drag(ev) {
    //   if (ev.type === "touchstart") {
    //     this.mobileItemSelect = ev.target.closest(".drag-drawflow").getAttribute('data-node');
    //   } else {
    //     ev.dataTransfer.setData("node", ev.target.getAttribute('data-node'));
    //   }
    // },
    // drop(ev) {
    //   if (ev.type === "touchend") {
    //     var parentdrawflow = document.elementFromPoint( mobile_last_move.touches[0].clientX, mobile_last_move.touches[0].clientY).closest("#drawflow");
    //     if(parentdrawflow != null) {
    //       addNodeToDrawFlow(this.mobileItemSelect, mobile_last_move.touches[0].clientX, mobile_last_move.touches[0].clientY);
    //     }
    //     this.mobileItemSelect = '';
    //   } else {
    //     ev.preventDefault();
    //     var data = ev.dataTransfer.getData("node");
    //     addNodeToDrawFlow(data, ev.clientX, ev.clientY);
    //   }
    //
    // }
  }
}
</script>

<style scoped>
</style>