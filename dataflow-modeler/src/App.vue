<template>
  <div>
    <header>
      <h2>Pipe Editor</h2>
    </header>
    <menu-component></menu-component>
    <div class="wrapper">
      <side-panel-component></side-panel-component>
      <canvas-component></canvas-component>
    </div>
  </div>
</template>

<script>

import SidePanelComponent from "@/components/SidePanelComponent";
import canvasComponent from "@/components/CanvasComponent";
import MenuComponent from "@/components/MenuComponent";

export default {
  name: 'App',
  components: {
    SidePanelComponent,
    canvasComponent,
    MenuComponent
  },
  /*beforeMount() {
    let jQueryScript = document.createElement('script');
    jQueryScript.setAttribute('src','https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.1/css/all.min.css');
    document.body.appendChild(jQueryScript);
  }*/
}
</script>

<style>

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

</style>
