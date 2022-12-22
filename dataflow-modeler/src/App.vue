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
          .get("NewNamespace.json"),
      axios
          .get("Provider.json")
    ]).then(axios.spread((response1,response2) =>{
          store.commit("SetNamespace",response1.data)
          store.commit("SetProviders",response2.data)
        })).catch(function (error) {
      if (error.response) {
        // Request made and server responded
        console.log(error.response.data);
        console.log(error.response.status);
        console.log(error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        console.log(error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.log('Error', error.message);
      }

    });
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
