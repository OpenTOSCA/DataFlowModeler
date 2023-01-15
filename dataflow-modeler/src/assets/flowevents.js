import Helper from "@/assets/helper";
import store from "@/plugins/store";

export default class FlowEvents{
    constructor() {
        this.helper= new Helper()
    }

    //Side Panel Events
    drop(ev) {
        if (ev.type === "touchend") {
            let parentDrawFlow = document.elementFromPoint( store.getters.GetMobileLastMove.touches[0].clientX, store.getters.GetMobileLastMove.touches[0].clientY).closest("#drawflow");
            if(parentDrawFlow != null) {
                this.helper.addNodeToDrawFlow(store.getters.GetMobileItemSelect, store.getters.GetMobileLastMove.touches[0].clientX, store.getters.GetMobileLastMove.touches[0].clientY);
            }
            store.getters.GetMobileItemSelect = '';
        } else {
            ev.preventDefault();
            let data = ev.dataTransfer.getData("node");
            this.helper.addNodeToDrawFlow(data, ev.clientX, ev.clientY);
        }

    }
    positionMobile(ev) {
        store.getters.GetMobileLastMove = ev;
    }

    drag(ev) {
        console.log(ev)
        if (ev.type === "touchstart") {
            store.getters.GetMobileItemSelect = ev.target.closest(".drag-drawflow").getAttribute('data-node');
        } else {
            ev.dataTransfer.setData("node", ev.target.getAttribute('data-node'));
        }
    }

    //Canvas Events
    allowDrop(ev) {
        ev.preventDefault();
    }

}