<template>
  <div>
    <header>
      <h2>Data Flow Modeler</h2>
    </header>
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
import store, {resetState} from "@/plugins/store";
import axios from "axios";

export default {
  name: 'App',
  components: {
    SidePanelComponent,
    canvasComponent
  },
  beforeMount() {
    resetState();
    axios.all([
      axios
          .get("Namespace.json"),
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
}

</style>
