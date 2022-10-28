/* eslint-disable */
<template>
  <div>
    <header>
      <h2>Pipe Editor</h2>
    </header>
<!--    <menu-component></menu-component>-->
    <div class="wrapper">
      <side-panel-component></side-panel-component>
      <canvas-component></canvas-component>
      <property-component></property-component>
    </div>
  </div>
</template>

<script>

import SidePanelComponent from "@/components/SidePanelComponent";
import canvasComponent from "@/components/CanvasComponent";
import store from "@/plugins/store";
import axios from "axios";
// import propertyComponent from "@/components/PropertyComponent";
// import MenuComponent from "@/components/MenuComponent";

export default {
  name: 'App',
  components: {
    SidePanelComponent,
    canvasComponent,
    // propertyComponent
    // MenuComponent
  },
  beforeMount() {
    axios.all([
      axios
          .get("Options.json"),
      axios
          .get("Provider.json")
    ]).then(axios.spread((response1,response2) =>{
          store.commit("SetOptions",response1.data)
          store.commit("SetProviders",response2.data)
        }));
  }
}
</script>

<style>

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  /*text-align: center;*/
  /*color: #2c3e50;*/
  /*margin-top: 60px;*/
}

</style>
