/* eslint-disable */
import store from "@/plugins/store";
export default class Drawflow {
  constructor(container, render = null, parent = null) {
    this.events = {};
    this.container = container;
    this.precanvas = null;
    this.nodeId = 1;
    this.ele_selected = null;
    this.node_selected = null;
    this.drag = false;
    this.reroute = false;
    this.reroute_fix_curvature = false;
    this.curvature = 0.5;
    this.reroute_curvature_start_end = 0.5;
    this.reroute_curvature = 0.5;
    this.reroute_width = 6;
    this.drag_point = false;
    this.editor_selected = false;
    this.connection = false;
    this.connection_ele = null;
    this.connection_selected = null;
    this.canvas_x = 0;
    this.canvas_y = 0;
    this.pos_x = 0;
    this.pos_x_start = 0;
    this.pos_y = 0;
    this.pos_y_start = 0;
    this.mouse_x = 0;
    this.mouse_y = 0;
    this.line_path = 5;
    this.first_click = null;
    this.force_first_input = false;
    this.draggable_inputs = true;
    this.useuuid = false;
    this.parent = parent;

    this.noderegister = {};
    this.render = render;
    this.drawflow = { "drawflow": { "Home": { "data": {} }}};
    // Configurable options
    this.module = 'Home';
    this.editor_mode = 'edit';
    this.zoom = 1;
    this.zoom_max = 1.6;
    this.zoom_min = 0.5;
    this.zoom_value = 0.1;
    this.zoom_last_value = 1;

    // Mobile
    this.evCache = [];
    this.prevDiff = -1;
    this.properties=null;

  }

  start () {
    // console.info("Start Drawflow!!");
    this.container.classList.add("parent-drawflow");
    this.container.tabIndex = 0;
    this.precanvas = document.createElement('div');
    this.precanvas.classList.add("drawflow");
    this.container.appendChild(this.precanvas);

    /* Mouse and Touch Actions */
    this.container.addEventListener('mouseup', this.dragEnd.bind(this));
    this.container.addEventListener('mousemove', this.position.bind(this));
    this.container.addEventListener('mousedown', this.click.bind(this) );

    this.container.addEventListener('touchend', this.dragEnd.bind(this));
    this.container.addEventListener('touchmove', this.position.bind(this));
    this.container.addEventListener('touchstart', this.click.bind(this));

    /* Context Menu */
    this.container.addEventListener('contextmenu', this.contextmenu.bind(this));
    /* Delete */
    this.container.addEventListener('keydown', this.key.bind(this));

    /* Zoom Mouse */
    this.container.addEventListener('wheel', this.zoom_enter.bind(this));
    /* Update data Nodes */
    this.container.addEventListener('input', this.updateNodeValue.bind(this));

    this.container.addEventListener('dblclick', this.dblclick.bind(this));
    /* Mobile zoom */
    this.container.onpointerdown = this.pointerdown_handler.bind(this);
    this.container.onpointermove = this.pointermove_handler.bind(this);
    this.container.onpointerup = this.pointerup_handler.bind(this);
    this.container.onpointercancel = this.pointerup_handler.bind(this);
    this.container.onpointerout = this.pointerup_handler.bind(this);
    this.container.onpointerleave = this.pointerup_handler.bind(this);

    this.load();
  }

  /* Mobile zoom */
  pointerdown_handler(ev) {
   this.evCache.push(ev);
  }

  pointermove_handler(ev) {
   for (let i = 0; i < this.evCache.length; i++) {
     if (ev.pointerId == this.evCache[i].pointerId) {
        this.evCache[i] = ev;
     break;
     }
   }

   if (this.evCache.length == 2) {
     // Calculate the distance between the two pointers
     let curDiff = Math.abs(this.evCache[0].clientX - this.evCache[1].clientX);

     if (this.prevDiff > 100) {
       if (curDiff > this.prevDiff) {
         // The distance between the two pointers has increased

         this.zoom_in();
       }
       if (curDiff < this.prevDiff) {
         // The distance between the two pointers has decreased
         this.zoom_out();
       }
     }
     this.prevDiff = curDiff;
   }
  }

  pointerup_handler(ev) {
    this.remove_event(ev);
    if (this.evCache.length < 2) {
      this.prevDiff = -1;
    }
  }
  remove_event(ev) {
   // Remove this event from the target's cache
   for (let i = 0; i < this.evCache.length; i++) {
     if (this.evCache[i].pointerId == ev.pointerId) {
       this.evCache.splice(i, 1);
       break;
     }
   }
  }
  /* End Mobile Zoom */
  load() {
    for (let key in this.drawflow.drawflow[this.module].data) {
      this.addNodeImport(this.drawflow.drawflow[this.module].data[key], this.precanvas);
    }

    if(this.reroute) {
      for (let key in this.drawflow.drawflow[this.module].data) {
        this.addRerouteImport(this.drawflow.drawflow[this.module].data[key]);
      }
    }

    for (let key in this.drawflow.drawflow[this.module].data) {
      this.updateConnectionNodes('node-'+key);
    }

    const editor = this.drawflow.drawflow;
    let number = 1;
    Object.keys(editor).map(function(moduleName, index) {
      Object.keys(editor[moduleName].data).map(function(id, index2) {
        if(parseInt(id) >= number) {
          number = parseInt(id)+1;
        }
      });
    });
    this.nodeId = number;
  }

  removeReouteConnectionSelected(){
    this.dispatch('connectionUnselected', true);
    if(this.reroute_fix_curvature) {
      this.connection_selected.parentElement.querySelectorAll(".main-path").forEach((item, i) => {
        item.classList.remove("selected");
      });
    }
  }

  click(e) {
    this.dispatch('click', e);
    if(this.editor_mode === 'fixed') {
      //return false;
       e.preventDefault();
       if(e.target.classList[0] === 'parent-drawflow' || e.target.classList[0] === 'drawflow') {
         this.ele_selected = e.target.closest(".parent-drawflow");
       } else {
         return false;
       }
    } else if(this.editor_mode === 'view') {
      if(e.target.closest(".drawflow") != null || e.target.matches('.parent-drawflow')) {
        this.ele_selected = e.target.closest(".parent-drawflow");
        e.preventDefault();
      }
    } else {
      this.first_click = e.target;
      this.ele_selected = e.target;
      if(e.button === 0) {
        this.contextmenuDel();
      }

      if(e.target.closest(".drawflow_content_node") != null) {
        this.ele_selected = e.target.closest(".drawflow_content_node").parentElement;
      }
    }
    switch (this.ele_selected.classList[0]) {
      case 'drawflow-node':
        if(this.node_selected != null) {
          this.node_selected.classList.remove("selected");
          if(this.node_selected != this.ele_selected) {
            this.dispatch('nodeUnselected', true);
          }
        }
        if(this.connection_selected != null) {
          this.connection_selected.classList.remove("selected");
          this.removeReouteConnectionSelected();
          this.connection_selected = null;
        }
        if(this.node_selected != this.ele_selected) {
          let index= parseInt(this.ele_selected.id.slice(5));

          this.dispatch('nodeSelected',{"nodeId":index,
            "name":this.drawflow.drawflow[this.module].data[index].name,
            "namespace":this.drawflow.drawflow[this.module].data[index].namespace,
            "type":this.drawflow.drawflow[this.module].data[index].type,
            "provider":this.drawflow.drawflow[this.module].data[index].provider,
            "location":this.drawflow.drawflow[this.module].data[index].location,
            "properties":this.drawflow.drawflow[this.module].data[index].properties});
        }
        this.node_selected = this.ele_selected;
        this.node_selected.classList.add("selected");
        if(!this.draggable_inputs) {
          if(e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA' && e.target.tagName !== 'SELECT' && e.target.hasAttribute('contenteditable') !== true) {
            this.drag = true;
          }
        } else {
          if(e.target.tagName !== 'SELECT') {
            this.drag = true;
          }
        }
        break;
      case 'output':
        this.connection = true;
        if(this.node_selected != null) {
          this.node_selected.classList.remove("selected");
          this.node_selected = null;
          this.dispatch('nodeUnselected', true);
        }
        if(this.connection_selected != null) {
          this.connection_selected.classList.remove("selected");
          this.removeReouteConnectionSelected();
          this.connection_selected = null;
        }
        this.drawConnection(e.target);
        break;
      case 'parent-drawflow':
        if(this.node_selected != null) {
          this.node_selected.classList.remove("selected");
          this.node_selected = null;
          this.dispatch('nodeUnselected', true);
        }
        if(this.connection_selected != null) {
          this.connection_selected.classList.remove("selected");
          this.removeReouteConnectionSelected();
          this.connection_selected = null;
        }
        this.editor_selected = true;
        break;
      case 'drawflow':
        if(this.node_selected != null) {
          this.node_selected.classList.remove("selected");
          this.node_selected = null;
          this.dispatch('nodeUnselected', true);
        }
        if(this.connection_selected != null) {
          this.connection_selected.classList.remove("selected");
          this.removeReouteConnectionSelected();
          this.connection_selected = null;
        }
        this.editor_selected = true;
        break;
      case 'main-path':
        if(this.node_selected != null) {
          this.node_selected.classList.remove("selected");
          this.node_selected = null;
          this.dispatch('nodeUnselected', true);
        }
        if(this.connection_selected != null) {
          this.connection_selected.classList.remove("selected");
          this.removeReouteConnectionSelected();
          this.connection_selected = null;
          this.dispatch('connectionUnselected', true);
        }
        this.connection_selected = this.ele_selected;
        this.connection_selected.classList.add("selected");
        const listclassConnection = this.connection_selected.parentElement.classList;
        let connectionDetail = this.drawflow.drawflow[this.module].data[listclassConnection[2].slice(14)].outputs[listclassConnection[3]].connections;
        this.dispatch('connectionSelected',{'output_id': listclassConnection[2].slice(14), 'input_id': listclassConnection[1].slice(13), 'output_class': listclassConnection[3], 'input_class': listclassConnection[4], 'type':connectionDetail[0].type});
        if(this.reroute_fix_curvature) {
          this.connection_selected.parentElement.querySelectorAll(".main-path").forEach((item, i) => {
            item.classList.add("selected");
          });
        }
      break;
      case 'point':
        this.drag_point = true;
        this.ele_selected.classList.add("selected");
      break;
      case 'drawflow-delete':
        if(this.node_selected ) {
          this.removeNodeId(this.node_selected.id);
        }

        if(this.connection_selected) {
          this.removeConnection();
        }

        if(this.node_selected != null) {
          this.node_selected.classList.remove("selected");
          this.node_selected = null;
          this.dispatch('nodeUnselected', true);
        }
        if(this.connection_selected != null) {
          this.connection_selected.classList.remove("selected");
          this.removeReouteConnectionSelected();
          this.connection_selected = null;
        }

      break;
      default:
    }
    if (e.type === "touchstart") {
      this.pos_x = e.touches[0].clientX;
      this.pos_x_start = e.touches[0].clientX;
      this.pos_y = e.touches[0].clientY;
      this.pos_y_start = e.touches[0].clientY;
    } else {
      this.pos_x = e.clientX;
      this.pos_x_start = e.clientX;
      this.pos_y = e.clientY;
      this.pos_y_start = e.clientY;
    }
    if (this.drag || ['input','output','main-path'].includes(this.ele_selected.classList[0])) {
      e.preventDefault();
    }
    this.dispatch('clickEnd', e);
  }

  updateNodeProperty(event,property){
    if(property.key!=null){
      this.drawflow.drawflow[this.module].data[event.target.closest(".drawflow_content_node").parentElement.id.slice(5)].properties.push({key:property.key,value:property.value});
      console.log(this.drawflow.drawflow[this.module].data[event.target.closest(".drawflow_content_node").parentElement.id.slice(5)].properties);
    }
  }

  position(e) {
    let e_pos_x=null;
    let e_pos_y=null;
    let x=null;
    let y=null;
    if (e.type === "touchmove") {
      e_pos_x = e.touches[0].clientX;
      e_pos_y = e.touches[0].clientY;
    } else {
      e_pos_x = e.clientX;
      e_pos_y = e.clientY;
    }


    if(this.connection) {
      this.updateConnection(e_pos_x,e_pos_y);
    }
    if(this.editor_selected) {
      x =  this.canvas_x + (-(this.pos_x - e_pos_x))
      y = this.canvas_y + (-(this.pos_y - e_pos_y))
      this.dispatch('translate', { x: x, y: y});
      this.precanvas.style.transform = "translate("+x+"px, "+y+"px) scale("+this.zoom+")";
    }


    if(this.drag||this.drag_point){
      x = (this.pos_x - e_pos_x) * this.precanvas.clientWidth / (this.precanvas.clientWidth * this.zoom);
      y = (this.pos_y - e_pos_y) * this.precanvas.clientHeight / (this.precanvas.clientHeight * this.zoom);
      this.pos_x = e_pos_x;
      this.pos_y = e_pos_y;
      if(this.drag) {
        this.ele_selected.style.top = (this.ele_selected.offsetTop - y) + "px";
        this.ele_selected.style.left = (this.ele_selected.offsetLeft - x) + "px";

        this.drawflow.drawflow[this.module].data[this.ele_selected.id.slice(5)].pos_x = (this.ele_selected.offsetLeft - x);
        this.drawflow.drawflow[this.module].data[this.ele_selected.id.slice(5)].pos_y = (this.ele_selected.offsetTop - y);

        this.updateConnectionNodes(this.ele_selected.id)
      }

      if(this.drag_point) {

        let pos_x = this.pos_x * ( this.precanvas.clientWidth / (this.precanvas.clientWidth * this.zoom)) - (this.precanvas.getBoundingClientRect().x * ( this.precanvas.clientWidth / (this.precanvas.clientWidth * this.zoom)));
        let pos_y = this.pos_y * ( this.precanvas.clientHeight / (this.precanvas.clientHeight * this.zoom)) - (this.precanvas.getBoundingClientRect().y * ( this.precanvas.clientHeight / (this.precanvas.clientHeight * this.zoom)));

        this.ele_selected.setAttributeNS(null, 'cx', pos_x.toString());
        this.ele_selected.setAttributeNS(null, 'cy', pos_y.toString());

        const nodeUpdate = this.ele_selected.parentElement.classList[2].slice(9);
        const nodeUpdateIn = this.ele_selected.parentElement.classList[1].slice(13);
        const output_class = this.ele_selected.parentElement.classList[3];
        const input_class = this.ele_selected.parentElement.classList[4];

        let numberPointPosition = Array.from(this.ele_selected.parentElement.children).indexOf(this.ele_selected)-1;

        if(this.reroute_fix_curvature) {
          const numberMainPath = this.ele_selected.parentElement.querySelectorAll(".main-path").length-1;
          numberPointPosition -= numberMainPath;
          if(numberPointPosition < 0) {
            numberPointPosition = 0;
          }
        }

        const nodeId = nodeUpdate.slice(5);
        const searchConnection = this.drawflow.drawflow[this.module].data[nodeId].outputs[output_class].connections.findIndex(function(item,i) {
          return item.node ===  nodeUpdateIn && item.output === input_class;
        });

        this.drawflow.drawflow[this.module].data[nodeId].outputs[output_class].connections[searchConnection].points[numberPointPosition] = { pos_x: pos_x, pos_y: pos_y };

        const parentSelected = this.ele_selected.parentElement.classList[2].slice(9);

        this.updateConnectionNodes(parentSelected);
      }
    }

    if (e.type === "touchmove") {
      this.mouse_x = e_pos_x;
      this.mouse_y = e_pos_y;
    }
    this.dispatch('mouseMove', {x: e_pos_x,y: e_pos_y });
  }

  dragEnd(e) {
    let e_pos_x = e.clientX;
    let e_pos_y = e.clientY;
    let ele_last = e.target;
    if (e.type === "touchend") {
      e_pos_x = this.mouse_x;
      e_pos_y = this.mouse_y;
      ele_last = document.elementFromPoint(e_pos_x, e_pos_y);
    }

    if(this.drag) {
      if(this.pos_x_start !== e_pos_x || this.pos_y_start !== e_pos_y) {
        this.dispatch('nodeMoved', this.ele_selected.id.slice(5));
      }
    }

    if(this.drag_point) {
      this.ele_selected.classList.remove("selected");
        if(this.pos_x_start !== e_pos_x || this.pos_y_start !== e_pos_y) {
          this.dispatch('rerouteMoved', this.ele_selected.parentElement.classList[2].slice(14));
        }
    }

    if(this.editor_selected) {
      this.canvas_x = this.canvas_x + (-(this.pos_x - e_pos_x));
      this.canvas_y = this.canvas_y + (-(this.pos_y - e_pos_y));
      this.editor_selected = false;
    }
    if(this.connection === true) {
      let input_id=null;
      let input_class=null;
      if(ele_last.classList[0] === 'input' || (this.force_first_input && (ele_last.closest(".drawflow_content_node") != null || ele_last.classList[0] === 'drawflow-node'))) {

        if(this.force_first_input && (ele_last.closest(".drawflow_content_node") != null || ele_last.classList[0] === 'drawflow-node')) {
          if(ele_last.closest(".drawflow_content_node") != null) {
            input_id = ele_last.closest(".drawflow_content_node").parentElement.id;
          } else {
            input_id = ele_last.id;
          }
         if(Object.keys(this.getNodeFromId(input_id.slice(5)).inputs).length === 0) {
           input_class = false;
         } else {
          input_class = "input_1";
         }


       } else {
         // Fix connection;
         input_id = ele_last.parentElement.parentElement.id;
         input_class = ele_last.classList[1];
       }
       let output_id = this.ele_selected.parentElement.parentElement.id;
       let output_class = this.ele_selected.classList[1];

        if(output_id !== input_id && input_class !== false) {

          if(this.container.querySelectorAll('.connection.node_in_'+input_id+'.node_out_'+output_id+'.'+output_class+'.'+input_class).length === 0) {
          // Conection no exist save connection

          this.connection_ele.classList.add("node_in_"+input_id);
          this.connection_ele.classList.add("node_out_"+output_id);
          this.connection_ele.classList.add(output_class);
          this.connection_ele.classList.add(input_class);
          let id_input = input_id.slice(5);
          let id_output = output_id.slice(5);

          this.drawflow.drawflow[this.module].data[id_output].outputs[output_class].connections.push( {"node": id_input, "output": input_class, "type":null});
          this.drawflow.drawflow[this.module].data[id_input].inputs[input_class].connections.push( {"node": id_output, "input": output_class, "type":null});
          this.updateConnectionNodes('node-'+id_output);
          this.updateConnectionNodes('node-'+id_input);
          this.dispatch('connectionCreated', { output_id: id_output, input_id: id_input, output_class:  output_class, input_class: input_class, 'type':null});

        } else {
          this.dispatch('connectionCancel', true);
          this.connection_ele.remove();
        }

          this.connection_ele = null;
      } else {
        // Connection exists Remove Connection;
        this.dispatch('connectionCancel', true);
        this.connection_ele.remove();
        this.connection_ele = null;
      }

      } else {
        // Remove Connection;
        this.dispatch('connectionCancel', true);
        this.connection_ele.remove();
        this.connection_ele = null;
      }
    }

    this.drag = false;
    this.drag_point = false;
    this.connection = false;
    this.ele_selected = null;
    this.editor_selected = false;

    this.dispatch('mouseUp', e);
  }
  contextmenu(e) {
    this.dispatch('contextmenu', e);
    e.preventDefault();
    if(this.editor_mode === 'fixed' || this.editor_mode === 'view') {
      return false;
    }
    if(this.precanvas.getElementsByClassName("drawflow-delete").length) {
      this.precanvas.getElementsByClassName("drawflow-delete")[0].remove()
    };
    if(this.node_selected || this.connection_selected) {
      let deletebox = document.createElement('div');
      deletebox.classList.add("drawflow-delete");
      deletebox.innerHTML = "x";
      if(this.node_selected) {
        this.node_selected.appendChild(deletebox);

      }
      if(this.connection_selected) {
        deletebox.style.top = e.clientY * ( this.precanvas.clientHeight / (this.precanvas.clientHeight * this.zoom)) - (this.precanvas.getBoundingClientRect().y *  ( this.precanvas.clientHeight / (this.precanvas.clientHeight * this.zoom)) ) + "px";
        deletebox.style.left = e.clientX * ( this.precanvas.clientWidth / (this.precanvas.clientWidth * this.zoom)) - (this.precanvas.getBoundingClientRect().x *  ( this.precanvas.clientWidth / (this.precanvas.clientWidth * this.zoom)) ) + "px";

        this.precanvas.appendChild(deletebox);

      }

    }

  }
  contextmenuDel() {
    if(this.precanvas.getElementsByClassName("drawflow-delete").length) {
      this.precanvas.getElementsByClassName("drawflow-delete")[0].remove()
    };
  }

  key(e) {
    this.dispatch('keydown', e);
    if(this.editor_mode === 'fixed' || this.editor_mode === 'view') {
      return false;
    }
    if (e.key === 'Delete' || (e.key === 'Backspace' && e.metaKey)) {
      if(this.node_selected != null) {
        if(this.first_click.tagName !== 'INPUT' && this.first_click.tagName !== 'TEXTAREA' && this.first_click.hasAttribute('contenteditable') !== true) {
          this.removeNodeId(this.node_selected.id);
        }
      }
      if(this.connection_selected != null) {
        this.removeConnection();
      }
    }
  }

  zoom_enter(event, delta) {
    if (event.ctrlKey) {
      event.preventDefault()
      if(event.deltaY > 0) {
        // Zoom Out
        this.zoom_out();
      } else {
        // Zoom In
        this.zoom_in();
      }
    }
  }
  zoom_refresh(){
    this.dispatch('zoom', this.zoom);
    this.canvas_x = (this.canvas_x / this.zoom_last_value) * this.zoom;
    this.canvas_y = (this.canvas_y / this.zoom_last_value) * this.zoom;
    this.zoom_last_value = this.zoom;
    this.precanvas.style.transform = "translate("+this.canvas_x+"px, "+this.canvas_y+"px) scale("+this.zoom+")";
  }
  zoom_in() {
    console.log('zoom in');
    if(this.zoom < this.zoom_max) {
        this.zoom+=this.zoom_value;
        this.zoom_refresh();
    }
  }
  zoom_out() {
    console.log('zoom out');
    if(this.zoom > this.zoom_min) {
      this.zoom-=this.zoom_value;
        this.zoom_refresh();
    }
  }
  zoom_reset(){
    console.log('zoom reset');
    if(this.zoom != 1) {
      this.zoom = 1;
      this.zoom_refresh();
    }
  }


  createCurvature(start_pos_x, start_pos_y, end_pos_x, end_pos_y, curvature_value, type) {
    let line_x = start_pos_x;
    let line_y = start_pos_y;
    let hx1=null;
    let hx2=null;
    let x = end_pos_x;
    let y = end_pos_y;
    var center_x = ((end_pos_x - start_pos_x)/2)+start_pos_x;
    let curvature = curvature_value;
    //type openclose open close other
    switch (type) {
      case 'open':
        if(start_pos_x >= end_pos_x) {
          hx1 = line_x + Math.abs(x - line_x) * curvature;
          hx2 = x - Math.abs(x - line_x) * (curvature*-1);
        } else {
          hx1 = line_x + Math.abs(x - line_x) * curvature;
          hx2 = x - Math.abs(x - line_x) * curvature;
        }
        //return ' M '+ line_x +' '+ line_y +' C '+ hx1 +' '+ line_y +' '+ hx2 +' ' + y +' ' + x +'  ' + y;

        break
      case 'close':
        if(start_pos_x >= end_pos_x) {
          hx1 = line_x + Math.abs(x - line_x) * (curvature*-1);
          hx2 = x - Math.abs(x - line_x) * curvature;
        } else {
          hx1 = line_x + Math.abs(x - line_x) * curvature;
          hx2 = x - Math.abs(x - line_x) * curvature;
        }
        //return ' M '+ line_x +' '+ line_y +' C '+ hx1 +' '+ line_y +' '+ hx2 +' ' + y +' ' + x +'  ' + y;
        break;
      case 'other':
        if(start_pos_x >= end_pos_x) {
          hx1 = line_x + Math.abs(x - line_x) * (curvature*-1);
          hx2 = x - Math.abs(x - line_x) * (curvature*-1);
        } else {
          hx1 = line_x + Math.abs(x - line_x) * curvature;
          hx2 = x - Math.abs(x - line_x) * curvature;
        }
        //return ' M '+ line_x +' '+ line_y +' C '+ hx1 +' '+ line_y +' '+ hx2 +' ' + y +' ' + x +'  ' + y;
        break;
      default:

        hx1 = line_x + Math.abs(x - line_x) * curvature;
        hx2 = x - Math.abs(x - line_x) * curvature;

        //return ' M '+ line_x +' '+ line_y +' C '+ hx1 +' '+ line_y +' '+ hx2 +' ' + y +' ' + x +'  ' + y;
    }
    // return ' M '+ line_x +' '+ line_y +' C '+ hx1 +' '+ line_y +' '+ hx2 +' ' + y +' ' + x +'  ' + y;

    return ' M '+ line_x +' '+ line_y +' C '+ hx1 +' '+ line_y +' '+ hx2 +' ' + y +' ' + x +'  ' + y +' M '+ (x-11)  + ' ' + y + ' L'+(x-20)+' '+ (y-5)+'  L'+(x-20)+' '+ (y+5)+' Z' +' M '+ (x-11)  + ' ' + y + ' L'+(x-20)+' '+ (y-3)+'  L'+(x-20)+' '+ (y+3)+' Z' +' M '+ (x-11)  + ' ' + y + ' L'+(x-20)+' '+ (y-1)+'  L'+(x-20)+' '+ (y+1)+' Z';
    // return ' M '+ line_x +' '+ line_y +' ' + x +'  ' + y +' M '+ (x-11)  + ' ' + y + ' L'+(x-20)+' '+ (y-5)+'  L'+(x-20)+' '+ (y+5)+' Z' +' M '+ (x-11)  + ' ' + y + ' L'+(x-20)+' '+ (y-3)+'  L'+(x-20)+' '+ (y+3)+' Z' +' M '+ (x-11)  + ' ' + y + ' L'+(x-20)+' '+ (y-1)+'  L'+(x-20)+' '+ (y+1)+' Z';
    // return ' M ' + start_pos_x + ' ' + start_pos_y + ' L '+ center_x +' ' +  start_pos_y  + ' L ' + center_x + ' ' +  end_pos_y  + ' L ' + end_pos_x + ' ' + end_pos_y;

  }

  drawConnection(ele) {
    // console.log(ele);
    let connection = document.createElementNS('http://www.w3.org/2000/svg',"svg");
    this.connection_ele = connection;
    let path = document.createElementNS('http://www.w3.org/2000/svg',"path");
    path.classList.add("main-path");
    path.setAttributeNS(null, 'd', '');
    connection.classList.add("connection");
    connection.appendChild(path);
    this.precanvas.appendChild(connection);
    let id_output = ele.parentElement.parentElement.id.slice(5);
    let output_class = ele.classList[1];
    this.dispatch('connectionStart', { output_id: id_output, output_class:  output_class });

  }

  updateConnection(eX, eY) {
    const precanvas = this.precanvas;
    const zoom = this.zoom;
    let precanvasWitdhZoom = precanvas.clientWidth / (precanvas.clientWidth * zoom);
    precanvasWitdhZoom = precanvasWitdhZoom || 0;
    let precanvasHeightZoom = precanvas.clientHeight / (precanvas.clientHeight * zoom);
    precanvasHeightZoom = precanvasHeightZoom || 0;
    let path = this.connection_ele.children[0];

    let line_x = this.ele_selected.offsetWidth/2 + (this.ele_selected.getBoundingClientRect().x - precanvas.getBoundingClientRect().x ) * precanvasWitdhZoom;
    let line_y = this.ele_selected.offsetHeight/2 + (this.ele_selected.getBoundingClientRect().y - precanvas.getBoundingClientRect().y ) * precanvasHeightZoom;

    let x = eX * ( this.precanvas.clientWidth / (this.precanvas.clientWidth * this.zoom)) - (this.precanvas.getBoundingClientRect().x *  ( this.precanvas.clientWidth / (this.precanvas.clientWidth * this.zoom)) );
    let y = eY * ( this.precanvas.clientHeight / (this.precanvas.clientHeight * this.zoom)) - (this.precanvas.getBoundingClientRect().y *  ( this.precanvas.clientHeight / (this.precanvas.clientHeight * this.zoom)) );

    let curvature = this.curvature;
    let lineCurve = this.createCurvature(line_x, line_y, x, y, curvature, 'openclose');
    path.setAttributeNS(null, 'd', lineCurve);

  }

  updateConnectionNodes(id) {

    // Aquí nos quedamos;
    const idSearch = 'node_in_'+id;
    const idSearchOut = 'node_out_'+id;
    let line_path = this.line_path/2;
    const container = this.container;
    const precanvas = this.precanvas;
    const curvature = this.curvature;
    const createCurvature = this.createCurvature;
    const reroute_curvature = this.reroute_curvature;
    const reroute_curvature_start_end = this.reroute_curvature_start_end;
    const reroute_fix_curvature = this.reroute_fix_curvature;
    const rerouteWidth = this.reroute_width;
    const zoom = this.zoom;
    let precanvasWitdhZoom = precanvas.clientWidth / (precanvas.clientWidth * zoom);
    precanvasWitdhZoom = precanvasWitdhZoom || 0;
    let precanvasHeightZoom = precanvas.clientHeight / (precanvas.clientHeight * zoom);
    precanvasHeightZoom = precanvasHeightZoom || 0;

    const elemsOut = container.querySelectorAll(`.${idSearchOut}`);

    Object.keys(elemsOut).map(function(item, index) {
      if(elemsOut[item].querySelector('.point') === null) {

        let elemtsearchId_out = container.querySelector(`#${id}`);

        let id_search = elemsOut[item].classList[1].replace('node_in_', '');
        let elemtsearchId = container.querySelector(`#${id_search}`);

        let elemtsearch = elemtsearchId.querySelectorAll('.'+elemsOut[item].classList[4])[0]

        let eX = elemtsearch.offsetWidth/2 + (elemtsearch.getBoundingClientRect().x - precanvas.getBoundingClientRect().x ) * precanvasWitdhZoom;
        let eY = elemtsearch.offsetHeight/2 + (elemtsearch.getBoundingClientRect().y - precanvas.getBoundingClientRect().y ) * precanvasHeightZoom;

        let elemtsearchOut = elemtsearchId_out.querySelectorAll('.'+elemsOut[item].classList[3])[0]

        let line_x =  elemtsearchOut.offsetWidth/2 + (elemtsearchOut.getBoundingClientRect().x - precanvas.getBoundingClientRect().x ) * precanvasWitdhZoom;
        let line_y =  elemtsearchOut.offsetHeight/2 + (elemtsearchOut.getBoundingClientRect().y - precanvas.getBoundingClientRect().y ) * precanvasHeightZoom;

        let x = eX;
        let y = eY;

        const lineCurve = createCurvature(line_x, line_y, x, y, curvature, 'openclose');
        elemsOut[item].children[0].setAttributeNS(null, 'd', lineCurve );
      } else {
        const points = elemsOut[item].querySelectorAll('.point');
        let linecurve = '';
        const reoute_fix = [];
        points.forEach((item, i) => {
          if(i === 0 && ((points.length -1) === 0)) {

            let elemtsearchId_out = container.querySelector(`#${id}`);
            let elemtsearch = item;

            let eX =  (elemtsearch.getBoundingClientRect().x - precanvas.getBoundingClientRect().x ) * precanvasWitdhZoom + rerouteWidth;
            let eY =  (elemtsearch.getBoundingClientRect().y - precanvas.getBoundingClientRect().y ) * precanvasHeightZoom + rerouteWidth;

            let elemtsearchOut = elemtsearchId_out.querySelectorAll('.'+item.parentElement.classList[3])[0]
            let line_x =  elemtsearchOut.offsetWidth/2 + (elemtsearchOut.getBoundingClientRect().x - precanvas.getBoundingClientRect().x ) * precanvasWitdhZoom;
            let line_y =  elemtsearchOut.offsetHeight/2 + (elemtsearchOut.getBoundingClientRect().y - precanvas.getBoundingClientRect().y ) * precanvasHeightZoom;
            let x = eX;
            let y = eY;

            let lineCurveSearch = createCurvature(line_x, line_y, x, y, reroute_curvature_start_end, 'open');
            linecurve += lineCurveSearch;
            reoute_fix.push(lineCurveSearch);

            elemtsearchId_out = item;
            let id_search = item.parentElement.classList[1].replace('node_in_', '');
            let elemtsearchId = container.querySelector(`#${id_search}`);
            elemtsearch = elemtsearchId.querySelectorAll('.'+item.parentElement.classList[4])[0]

            let elemtsearchIn = elemtsearchId.querySelectorAll('.'+item.parentElement.classList[4])[0]
            eX =  elemtsearchIn.offsetWidth/2 + (elemtsearchIn.getBoundingClientRect().x - precanvas.getBoundingClientRect().x ) * precanvasWitdhZoom;
            eY =  elemtsearchIn.offsetHeight/2 + (elemtsearchIn.getBoundingClientRect().y - precanvas.getBoundingClientRect().y ) * precanvasHeightZoom;


            line_x = (elemtsearchId_out.getBoundingClientRect().x - precanvas.getBoundingClientRect().x ) * precanvasWitdhZoom + rerouteWidth;
            line_y = (elemtsearchId_out.getBoundingClientRect().y - precanvas.getBoundingClientRect().y ) * precanvasHeightZoom + rerouteWidth;
            x = eX;
            y = eY;

            lineCurveSearch = createCurvature(line_x, line_y, x, y, reroute_curvature_start_end, 'close');
            linecurve += lineCurveSearch;
            reoute_fix.push(lineCurveSearch);

          } else if(i === 0) {

            let elemtsearchId_out = container.querySelector(`#${id}`);
            let elemtsearch = item;

            let eX = (elemtsearch.getBoundingClientRect().x - precanvas.getBoundingClientRect().x ) * precanvasWitdhZoom + rerouteWidth;
            let eY = (elemtsearch.getBoundingClientRect().y - precanvas.getBoundingClientRect().y ) * precanvasHeightZoom + rerouteWidth;

            let elemtsearchOut = elemtsearchId_out.querySelectorAll('.'+item.parentElement.classList[3])[0]
            let line_x =  elemtsearchOut.offsetWidth/2 + (elemtsearchOut.getBoundingClientRect().x - precanvas.getBoundingClientRect().x ) * precanvasWitdhZoom;
            let line_y =  elemtsearchOut.offsetHeight/2 + (elemtsearchOut.getBoundingClientRect().y - precanvas.getBoundingClientRect().y ) * precanvasHeightZoom;

            let x = eX;
            let y = eY;

            let lineCurveSearch = createCurvature(line_x, line_y, x, y, reroute_curvature_start_end, 'open');
            linecurve += lineCurveSearch;
            reoute_fix.push(lineCurveSearch);

            // SECOND
            elemtsearchId_out = item;
            elemtsearch = points[i+1];

            eX = (elemtsearch.getBoundingClientRect().x - precanvas.getBoundingClientRect().x ) * precanvasWitdhZoom + rerouteWidth;
            eY = (elemtsearch.getBoundingClientRect().y - precanvas.getBoundingClientRect().y ) * precanvasHeightZoom + rerouteWidth;
            line_x = (elemtsearchId_out.getBoundingClientRect().x - precanvas.getBoundingClientRect().x ) * precanvasWitdhZoom + rerouteWidth;
            line_y = (elemtsearchId_out.getBoundingClientRect().y - precanvas.getBoundingClientRect().y ) * precanvasHeightZoom + rerouteWidth;
            x = eX;
            y = eY;

            lineCurveSearch = createCurvature(line_x, line_y, x, y, reroute_curvature, 'other');
            linecurve += lineCurveSearch;
            reoute_fix.push(lineCurveSearch);

          } else if (i === (points.length -1)) {

            let elemtsearchId_out = item;

            let id_search = item.parentElement.classList[1].replace('node_in_', '');
            let elemtsearchId = container.querySelector(`#${id_search}`);
            let elemtsearch = elemtsearchId.querySelectorAll('.'+item.parentElement.classList[4])[0]

            let elemtsearchIn = elemtsearchId.querySelectorAll('.'+item.parentElement.classList[4])[0]
            let eX =  elemtsearchIn.offsetWidth/2 + (elemtsearchIn.getBoundingClientRect().x - precanvas.getBoundingClientRect().x ) * precanvasWitdhZoom;
            let eY =  elemtsearchIn.offsetHeight/2 + (elemtsearchIn.getBoundingClientRect().y - precanvas.getBoundingClientRect().y ) * precanvasHeightZoom;
            let line_x = (elemtsearchId_out.getBoundingClientRect().x - precanvas.getBoundingClientRect().x ) * (precanvas.clientWidth / (precanvas.clientWidth * zoom)) + rerouteWidth;
            let line_y = (elemtsearchId_out.getBoundingClientRect().y - precanvas.getBoundingClientRect().y ) * (precanvas.clientHeight / (precanvas.clientHeight * zoom)) + rerouteWidth;
            let x = eX;
            let y = eY;

            let lineCurveSearch = createCurvature(line_x, line_y, x, y, reroute_curvature_start_end, 'close');
            linecurve += lineCurveSearch;
            reoute_fix.push(lineCurveSearch);

          } else {
            let elemtsearchId_out = item;
            let elemtsearch = points[i+1];

            let eX = (elemtsearch.getBoundingClientRect().x - precanvas.getBoundingClientRect().x ) * (precanvas.clientWidth / (precanvas.clientWidth * zoom)) + rerouteWidth;
            let eY = (elemtsearch.getBoundingClientRect().y - precanvas.getBoundingClientRect().y ) * (precanvas.clientHeight / (precanvas.clientHeight * zoom)) +rerouteWidth;
            let line_x = (elemtsearchId_out.getBoundingClientRect().x - precanvas.getBoundingClientRect().x ) * (precanvas.clientWidth / (precanvas.clientWidth * zoom)) + rerouteWidth;
            let line_y = (elemtsearchId_out.getBoundingClientRect().y - precanvas.getBoundingClientRect().y ) * (precanvas.clientHeight / (precanvas.clientHeight * zoom)) + rerouteWidth;
            let x = eX;
            let y = eY;

            let lineCurveSearch = createCurvature(line_x, line_y, x, y, reroute_curvature, 'other');
            linecurve += lineCurveSearch;
            reoute_fix.push(lineCurveSearch);
          }

        });
        if(reroute_fix_curvature) {
          reoute_fix.forEach((itempath, i) => {
            elemsOut[item].children[i].setAttributeNS(null, 'd', itempath);
          });

        } else {
          elemsOut[item].children[0].setAttributeNS(null, 'd', linecurve);
        }

      }
    })

    const elems = container.querySelectorAll(`.${idSearch}`);
    Object.keys(elems).map(function(item, index) {

      if(elems[item].querySelector('.point') === null) {
        let elemtsearchId_in = container.querySelector(`#${id}`);

        let id_search = elems[item].classList[2].replace('node_out_', '');
        let elemtsearchId = container.querySelector(`#${id_search}`);
        let elemtsearch = elemtsearchId.querySelectorAll('.'+elems[item].classList[3])[0]

        let line_x = elemtsearch.offsetWidth/2 + (elemtsearch.getBoundingClientRect().x - precanvas.getBoundingClientRect().x ) * precanvasWitdhZoom;
        let line_y = elemtsearch.offsetHeight/2 + (elemtsearch.getBoundingClientRect().y - precanvas.getBoundingClientRect().y ) * precanvasHeightZoom;

        elemtsearchId_in = elemtsearchId_in.querySelectorAll('.'+elems[item].classList[4])[0]
        let x = elemtsearchId_in.offsetWidth/2 + (elemtsearchId_in.getBoundingClientRect().x - precanvas.getBoundingClientRect().x ) * precanvasWitdhZoom;
        let y = elemtsearchId_in.offsetHeight/2 + (elemtsearchId_in.getBoundingClientRect().y - precanvas.getBoundingClientRect().y ) * precanvasHeightZoom;

        const lineCurve = createCurvature(line_x, line_y, x, y, curvature, 'openclose');
        elems[item].children[0].setAttributeNS(null, 'd', lineCurve );

      } else {
        const points = elems[item].querySelectorAll('.point');
        let linecurve = '';
        const reoute_fix = [];
        points.forEach((item, i) => {
          if(i === 0 && ((points.length -1) === 0)) {

            var elemtsearchId_out = container.querySelector(`#${id}`);
            var elemtsearch = item;

            var line_x = (elemtsearch.getBoundingClientRect().x - precanvas.getBoundingClientRect().x ) * precanvasWitdhZoom + rerouteWidth;
            var line_y = (elemtsearch.getBoundingClientRect().y - precanvas.getBoundingClientRect().y ) * precanvasHeightZoom +rerouteWidth;

            var elemtsearchIn = elemtsearchId_out.querySelectorAll('.'+item.parentElement.classList[4])[0]
            var eX =  elemtsearchIn.offsetWidth/2 + (elemtsearchIn.getBoundingClientRect().x - precanvas.getBoundingClientRect().x ) * precanvasWitdhZoom;
            var eY =  elemtsearchIn.offsetHeight/2 + (elemtsearchIn.getBoundingClientRect().y - precanvas.getBoundingClientRect().y ) * precanvasHeightZoom;

            var x = eX;
            var y = eY;

            var lineCurveSearch = createCurvature(line_x, line_y, x, y, reroute_curvature_start_end, 'close');
            linecurve += lineCurveSearch;
            reoute_fix.push(lineCurveSearch);

            var elemtsearchId_out = item;
            var id_search = item.parentElement.classList[2].replace('node_out_', '');
            var elemtsearchId = container.querySelector(`#${id_search}`);
            var elemtsearch = elemtsearchId.querySelectorAll('.'+item.parentElement.classList[3])[0]

            var elemtsearchOut = elemtsearchId.querySelectorAll('.'+item.parentElement.classList[3])[0]
            var line_x =  elemtsearchOut.offsetWidth/2 + (elemtsearchOut.getBoundingClientRect().x - precanvas.getBoundingClientRect().x ) * precanvasWitdhZoom;
            var line_y =  elemtsearchOut.offsetHeight/2 + (elemtsearchOut.getBoundingClientRect().y - precanvas.getBoundingClientRect().y ) * precanvasHeightZoom;

            var eX = (elemtsearchId_out.getBoundingClientRect().x - precanvas.getBoundingClientRect().x ) * precanvasWitdhZoom + rerouteWidth;
            var eY = (elemtsearchId_out.getBoundingClientRect().y - precanvas.getBoundingClientRect().y ) * precanvasHeightZoom + rerouteWidth;
            var x = eX;
            var y = eY;

            var lineCurveSearch = createCurvature(line_x, line_y, x, y, reroute_curvature_start_end, 'open');
            linecurve += lineCurveSearch;
            reoute_fix.push(lineCurveSearch);


          } else if(i === 0) {
            // FIRST
            var elemtsearchId_out = item;
            var id_search = item.parentElement.classList[2].replace('node_out_', '');
            var elemtsearchId = container.querySelector(`#${id_search}`);
            var elemtsearch = elemtsearchId.querySelectorAll('.'+item.parentElement.classList[3])[0]
            var elemtsearchOut = elemtsearchId.querySelectorAll('.'+item.parentElement.classList[3])[0]
            var line_x =  elemtsearchOut.offsetWidth/2 + (elemtsearchOut.getBoundingClientRect().x - precanvas.getBoundingClientRect().x ) * precanvasWitdhZoom;
            var line_y =  elemtsearchOut.offsetHeight/2 + (elemtsearchOut.getBoundingClientRect().y - precanvas.getBoundingClientRect().y ) * precanvasHeightZoom;

            var eX = (elemtsearchId_out.getBoundingClientRect().x - precanvas.getBoundingClientRect().x ) * precanvasWitdhZoom + rerouteWidth;
            var eY = (elemtsearchId_out.getBoundingClientRect().y - precanvas.getBoundingClientRect().y ) * precanvasHeightZoom + rerouteWidth;
            var x = eX;
            var y = eY;

            var lineCurveSearch = createCurvature(line_x, line_y, x, y, reroute_curvature_start_end, 'open');
            linecurve += lineCurveSearch;
            reoute_fix.push(lineCurveSearch);

            // SECOND
            var elemtsearchId_out = item;
            var elemtsearch = points[i+1];

            var eX = (elemtsearch.getBoundingClientRect().x - precanvas.getBoundingClientRect().x ) * precanvasWitdhZoom + rerouteWidth;
            var eY = (elemtsearch.getBoundingClientRect().y - precanvas.getBoundingClientRect().y ) * precanvasHeightZoom +rerouteWidth;
            var line_x = (elemtsearchId_out.getBoundingClientRect().x - precanvas.getBoundingClientRect().x ) * precanvasWitdhZoom + rerouteWidth;
            var line_y = (elemtsearchId_out.getBoundingClientRect().y - precanvas.getBoundingClientRect().y ) * precanvasHeightZoom + rerouteWidth;
            var x = eX;
            var y = eY;

            var lineCurveSearch = createCurvature(line_x, line_y, x, y, reroute_curvature, 'other');
            linecurve += lineCurveSearch;
            reoute_fix.push(lineCurveSearch);

          } else if (i === (points.length -1)) {

            var elemtsearchId_out = item;

            var id_search = item.parentElement.classList[1].replace('node_in_', '');
            var elemtsearchId = container.querySelector(`#${id_search}`);
            var elemtsearch = elemtsearchId.querySelectorAll('.'+item.parentElement.classList[4])[0]

            var elemtsearchIn = elemtsearchId.querySelectorAll('.'+item.parentElement.classList[4])[0]
            var eX =  elemtsearchIn.offsetWidth/2 + (elemtsearchIn.getBoundingClientRect().x - precanvas.getBoundingClientRect().x ) * precanvasWitdhZoom;
            var eY =  elemtsearchIn.offsetHeight/2 + (elemtsearchIn.getBoundingClientRect().y - precanvas.getBoundingClientRect().y ) * precanvasHeightZoom;

            var line_x = (elemtsearchId_out.getBoundingClientRect().x - precanvas.getBoundingClientRect().x ) * precanvasWitdhZoom + rerouteWidth;
            var line_y = (elemtsearchId_out.getBoundingClientRect().y - precanvas.getBoundingClientRect().y ) * precanvasHeightZoom + rerouteWidth;
            var x = eX;
            var y = eY;

            var lineCurveSearch = createCurvature(line_x, line_y, x, y, reroute_curvature_start_end, 'close');
            linecurve += lineCurveSearch;
            reoute_fix.push(lineCurveSearch);

          } else {

            var elemtsearchId_out = item;
            var elemtsearch = points[i+1];

            var eX = (elemtsearch.getBoundingClientRect().x - precanvas.getBoundingClientRect().x ) * precanvasWitdhZoom + rerouteWidth;
            var eY = (elemtsearch.getBoundingClientRect().y - precanvas.getBoundingClientRect().y ) * precanvasHeightZoom +rerouteWidth;
            var line_x = (elemtsearchId_out.getBoundingClientRect().x - precanvas.getBoundingClientRect().x ) * precanvasWitdhZoom + rerouteWidth;
            var line_y = (elemtsearchId_out.getBoundingClientRect().y - precanvas.getBoundingClientRect().y ) * precanvasHeightZoom + rerouteWidth;
            var x = eX;
            var y = eY;

            var lineCurveSearch = createCurvature(line_x, line_y, x, y, reroute_curvature, 'other');
            linecurve += lineCurveSearch;
            reoute_fix.push(lineCurveSearch);
          }

        });
        if(reroute_fix_curvature) {
          reoute_fix.forEach((itempath, i) => {
            elems[item].children[i].setAttributeNS(null, 'd', itempath);
          });

        } else {
          elems[item].children[0].setAttributeNS(null, 'd', linecurve);
        }

      }
    })
  }

  dblclick(e) {
    if(this.connection_selected != null && this.reroute) {
        this.createReroutePoint(this.connection_selected);
    }

    if(e.target.classList[0] === 'point') {
        this.removeReroutePoint(e.target);
    }

    // if(this.node_selected!=null){
    //   // var popUpdiv= document.getElementById('divPop');
    //   // console.log(popUpdiv);
    //   // //popUpdiv.css({ left: this.node_selected.offsetLeft + this.node_selected.offsetWidth + 10, top: this.node_selected.offsetTop + this.node_selected.offsetHeight + 10 });
    //   //
    //   // if(popUpdiv.style.display==='none'){
    //   //   popUpdiv.setAttribute("style", "left: "+this.node_selected.offsetLeft + this.node_selected.offsetWidth + 10+"; width:"+this.node_selected.offsetTop + this.node_selected.offsetHeight + 10+";");
    //   //   popUpdiv.style.display='block'
    //   // }
    //   // else{
    //   //   popUpdiv.setAttribute("style", "z-index:500;position:absolute;display:none");
    //   //   popUpdiv.style.display='none';
    //   // }
    //   // // let nodeSelect= document.getElementById(this.)
    //   // // var pos=nodeSelect.offset();
    //   // // var h=nodeSelect.height();
    //   // // var w=nodeSelect.width();
    //   if(this.node_selected.hasChildNodes()){
    //
    //   }
    //   let deletebox = document.createElement('div');
    //   deletebox.classList.add("drawflow-property");
    //   deletebox.innerHTML = "x";
    //   this.node_selected.appendChild(deletebox);
    // }
  }

  createReroutePoint(ele) {
      this.connection_selected.classList.remove("selected");
      const nodeUpdate = this.connection_selected.parentElement.classList[2].slice(9);
      const nodeUpdateIn = this.connection_selected.parentElement.classList[1].slice(13);
      const output_class = this.connection_selected.parentElement.classList[3];
      const input_class = this.connection_selected.parentElement.classList[4];
      this.connection_selected = null;
      const point = document.createElementNS('http://www.w3.org/2000/svg',"circle");
      point.classList.add("point");
      var pos_x = this.pos_x * ( this.precanvas.clientWidth / (this.precanvas.clientWidth * this.zoom)) - (this.precanvas.getBoundingClientRect().x * ( this.precanvas.clientWidth / (this.precanvas.clientWidth * this.zoom)));
      var pos_y = this.pos_y * ( this.precanvas.clientHeight / (this.precanvas.clientHeight * this.zoom)) - (this.precanvas.getBoundingClientRect().y * ( this.precanvas.clientHeight / (this.precanvas.clientHeight * this.zoom)));

      point.setAttributeNS(null, 'cx', pos_x);
      point.setAttributeNS(null, 'cy', pos_y);
      point.setAttributeNS(null, 'r', this.reroute_width);

      let position_add_array_point = 0;
      if(this.reroute_fix_curvature) {

        const numberPoints = ele.parentElement.querySelectorAll(".main-path").length;
        var path = document.createElementNS('http://www.w3.org/2000/svg',"path");
        path.classList.add("main-path");
        path.setAttributeNS(null, 'd', '');

        ele.parentElement.insertBefore(path, ele.parentElement.children[numberPoints]);
        if(numberPoints === 1) {
          ele.parentElement.appendChild(point);
        }  else {
          const search_point = Array.from(ele.parentElement.children).indexOf(ele)
          position_add_array_point = search_point;
          ele.parentElement.insertBefore(point, ele.parentElement.children[search_point+numberPoints+1]);
        }

      } else {
        ele.parentElement.appendChild(point);
      }

      const nodeId = nodeUpdate.slice(5);
      const searchConnection = this.drawflow.drawflow[this.module].data[nodeId].outputs[output_class].connections.findIndex(function(item,i) {
        return item.node ===  nodeUpdateIn && item.output === input_class;
      });

      if(this.drawflow.drawflow[this.module].data[nodeId].outputs[output_class].connections[searchConnection].points === undefined)  {
        this.drawflow.drawflow[this.module].data[nodeId].outputs[output_class].connections[searchConnection].points = [];
      }

      if(this.reroute_fix_curvature) {

        if(position_add_array_point > 0 || this.drawflow.drawflow[this.module].data[nodeId].outputs[output_class].connections[searchConnection].points !== []) {
          this.drawflow.drawflow[this.module].data[nodeId].outputs[output_class].connections[searchConnection].points.splice(position_add_array_point, 0, { pos_x: pos_x, pos_y: pos_y });
        } else {
          this.drawflow.drawflow[this.module].data[nodeId].outputs[output_class].connections[searchConnection].points.push({ pos_x: pos_x, pos_y: pos_y });
        }

        ele.parentElement.querySelectorAll(".main-path").forEach((item, i) => {
          item.classList.remove("selected");
        });

      } else {
        this.drawflow.drawflow[this.module].data[nodeId].outputs[output_class].connections[searchConnection].points.push({ pos_x: pos_x, pos_y: pos_y });
      }

      this.dispatch('addReroute', nodeId);
      this.updateConnectionNodes(nodeUpdate);
  }

  removeReroutePoint(ele) {
    const nodeUpdate = ele.parentElement.classList[2].slice(9)
    const nodeUpdateIn = ele.parentElement.classList[1].slice(13);
    const output_class = ele.parentElement.classList[3];
    const input_class = ele.parentElement.classList[4];

    let numberPointPosition = Array.from(ele.parentElement.children).indexOf(ele);
    const nodeId = nodeUpdate.slice(5);
    const searchConnection = this.drawflow.drawflow[this.module].data[nodeId].outputs[output_class].connections.findIndex(function(item,i) {
      return item.node ===  nodeUpdateIn && item.output === input_class;
    });

    if(this.reroute_fix_curvature) {
       const numberMainPath = ele.parentElement.querySelectorAll(".main-path").length
       ele.parentElement.children[numberMainPath-1].remove();
       numberPointPosition -= numberMainPath;
       if(numberPointPosition < 0) {
         numberPointPosition = 0;
       }
    } else {
      numberPointPosition--;
    }
    this.drawflow.drawflow[this.module].data[nodeId].outputs[output_class].connections[searchConnection].points.splice(numberPointPosition,1);

    ele.remove();
    this.dispatch('removeReroute', nodeId);
    this.updateConnectionNodes(nodeUpdate);
  }

  registerNode(name, html, props = null, options = null) {
    this.noderegister[name] = {html: html, props: props, options: options};
  }

  getNodeFromId(id) {
    var moduleName = this.getModuleFromNodeId(id)
    return JSON.parse(JSON.stringify(this.drawflow.drawflow[moduleName].data[id]));
  }
  getNodesFromName(name) {
    var nodes = [];
    const editor = this.drawflow.drawflow
    Object.keys(editor).map(function(moduleName, index) {
      for (var node in editor[moduleName].data) {
        if(editor[moduleName].data[node].name == name) {
          nodes.push(editor[moduleName].data[node].id);
        }
      }
    });
    return nodes;
  }

  addNode (name, num_in, num_out, ele_pos_x, ele_pos_y, classoverride, data, html, typenode = false) {
    if (this.useuuid) {
      var newNodeId = this.getUuid();
    } else {
      var newNodeId = this.nodeId;
    }
    const parent = document.createElement('div');
    parent.classList.add("parent-node");
    const node = document.createElement('div');
    node.innerHTML = "";
    node.setAttribute("id", "node-"+newNodeId);
    node.classList.add("drawflow-node");
    if(classoverride != '') {
      node.classList.add(...classoverride.split(' '));
    }

    const inputs = document.createElement('div');
    inputs.classList.add("inputs");

    const outputs = document.createElement('div');
    outputs.classList.add("outputs");

    const json_inputs = {}
    for(var x = 0; x < num_in; x++) {
      const input = document.createElement('div');
      input.classList.add("input");
      input.classList.add("input_"+(x+1));
      json_inputs["input_"+(x+1)] = { "connections": []};
      inputs.appendChild(input);
    }

    const json_outputs = {}
    for(var x = 0; x < num_out; x++) {
      const output = document.createElement('div');
      output.classList.add("output");
      output.classList.add("output_"+(x+1));
      json_outputs["output_"+(x+1)] = { "connections": []};
      outputs.appendChild(output);
    }

    const content = document.createElement('div');
    content.classList.add("drawflow_content_node");
    html=`<div class="title-box">${html}</div>`;
    if(typenode === false) {
      content.innerHTML = html;
    } else if (typenode === true) {
      content.appendChild(this.noderegister[html].html.cloneNode(true));
    } else {
      if(parseInt(this.render.version) === 3 ) {
        //Vue 3
        let wrapper = this.render.h(this.noderegister[html].html, this.noderegister[html].props, this.noderegister[html].options);
        wrapper.appContext = this.parent;
        this.render.render(wrapper,content);

      } else {
        // Vue 2
        let wrapper = new this.render({
          parent: this.parent,
          render: h => h(this.noderegister[html].html, { props: this.noderegister[html].props }),
          ...this.noderegister[html].options
        }).$mount()
        //
        content.appendChild(wrapper.$el);
      }
    }

    Object.entries(data).forEach(function (key, value) {
      if(typeof key[1] === "object") {
        insertObjectkeys(null, key[0], key[0]);
      } else {
        var elems = content.querySelectorAll('[df-'+key[0]+']');
          for(var i = 0; i < elems.length; i++) {
            elems[i].value = key[1];
            if(elems[i].isContentEditable) {
              elems[i].innerText = key[1];
            }
          }
      }
    })

    function insertObjectkeys(object, name, completname) {
      if(object === null) {
        var object = data[name];
      } else {
        var object = object[name]
      }
      if(object !== null) {
        Object.entries(object).forEach(function (key, value) {
          if(typeof key[1] === "object") {
            insertObjectkeys(object, key[0], completname+'-'+key[0]);
          } else {
            var elems = content.querySelectorAll('[df-'+completname+'-'+key[0]+']');
              for(var i = 0; i < elems.length; i++) {
                elems[i].value = key[1];
                if(elems[i].isContentEditable) {
                  elems[i].innerText = key[1];
                }
              }
          }
        });
      }
    }
    node.appendChild(inputs);
    node.appendChild(content);
    node.appendChild(outputs);
    node.style.top = ele_pos_y + "px";
    node.style.left = ele_pos_x + "px";
    parent.appendChild(node);
    this.precanvas.appendChild(parent);
    var json = {
      id: newNodeId,
      name: name,
      namespace:'',
      type:'',
      provider:'',
      location:'',
      data: data,
      class: classoverride,
      html: html,
      typenode: typenode,
      inputs: json_inputs,
      outputs: json_outputs,
      properties: [],
      pos_x: ele_pos_x,
      pos_y: ele_pos_y,
    }
    if(json.class === 'input')
      json.properties.push({'key':'DataSize','value':''});
    else if (json.class === 'filter')
      json.properties.push({'key':'DataFactor','value':''});
    store.commit("SetPropertyData",{'id':json.name});
    this.drawflow.drawflow[this.module].data[newNodeId] = json;
    this.dispatch('nodeCreated', newNodeId);
    if (!this.useuuid) {
      this.nodeId++;
    }
    return newNodeId;
  }

  addNodeImport (dataNode, precanvas) {
    const parent = document.createElement('div');
    parent.classList.add("parent-node");

    const node = document.createElement('div');
    node.innerHTML = "";
    node.setAttribute("id", "node-"+dataNode.id);
    node.classList.add("drawflow-node");
    if(dataNode.class != '') {
      node.classList.add(...dataNode.class.split(' '));
    }

    const inputs = document.createElement('div');
    inputs.classList.add("inputs");

    const outputs = document.createElement('div');
    outputs.classList.add("outputs");

    const properties = document.createElement('div');
    properties.classList.add("properties");

    Object.keys(dataNode.inputs).map(function(input_item, index) {
      const input = document.createElement('div');
      input.classList.add("input");
      input.classList.add(input_item);
      inputs.appendChild(input);
      Object.keys(dataNode.inputs[input_item].connections).map(function(output_item, index) {

        var connection = document.createElementNS('http://www.w3.org/2000/svg',"svg");
        var path = document.createElementNS('http://www.w3.org/2000/svg',"path");
        path.classList.add("main-path");
        path.setAttributeNS(null, 'd', '');
        // path.innerHTML = 'a';
        connection.classList.add("connection");
        connection.classList.add("node_in_node-"+dataNode.id);
        connection.classList.add("node_out_node-"+dataNode.inputs[input_item].connections[output_item].node);
        connection.classList.add(dataNode.inputs[input_item].connections[output_item].input);
        connection.classList.add(input_item);

        connection.appendChild(path);
        precanvas.appendChild(connection);

      });
    });

    for(var x = 0; x < Object.keys(dataNode.outputs).length; x++) {
      const output = document.createElement('div');
      output.classList.add("output");
      output.classList.add("output_"+(x+1));
      outputs.appendChild(output);
    }

    for(var x = 0; x < Object.keys(dataNode.properties).length; x++) {
      const property = document.createElement('div');
      property.classList.add("property");
      property.classList.add("property_"+(x+1));
      properties.appendChild(property);
    }

    const content = document.createElement('div');
    content.classList.add("drawflow_content_node");

    if(dataNode.typenode === false) {
      content.innerHTML = dataNode.html;
    } else if (dataNode.typenode === true) {
      content.appendChild(this.noderegister[dataNode.html].html.cloneNode(true));
    } else {
      if(parseInt(this.render.version) === 3 ) {
        //Vue 3
        let wrapper = this.render.h(this.noderegister[dataNode.html].html, this.noderegister[dataNode.html].props, this.noderegister[dataNode.html].options);
        wrapper.appContext = this.parent;
        this.render.render(wrapper,content);

      } else {
        //Vue 2
        let wrapper = new this.render({
          parent: this.parent,
          render: h => h(this.noderegister[dataNode.html].html, { props: this.noderegister[dataNode.html].props }),
          ...this.noderegister[dataNode.html].options
        }).$mount()
        content.appendChild(wrapper.$el);
      }
    }

    Object.entries(dataNode.data).forEach(function (key, value) {
      if(typeof key[1] === "object") {
        insertObjectkeys(null, key[0], key[0]);
      } else {
        var elems = content.querySelectorAll('[df-'+key[0]+']');
          for(var i = 0; i < elems.length; i++) {
            elems[i].value = key[1];
            if(elems[i].isContentEditable) {
              elems[i].innerText = key[1];
            }
          }
      }
    })

    function insertObjectkeys(object, name, completname) {
      if(object === null) {
        var object = dataNode.data[name];
      } else {
        var object = object[name]
      }
      if(object !== null) {
        Object.entries(object).forEach(function (key, value) {
          if(typeof key[1] === "object") {
            insertObjectkeys(object, key[0], completname+'-'+key[0]);
          } else {
            var elems = content.querySelectorAll('[df-'+completname+'-'+key[0]+']');
              for(var i = 0; i < elems.length; i++) {
                elems[i].value = key[1];
                if(elems[i].isContentEditable) {
                  elems[i].innerText = key[1];
                }
              }
          }
        });
      }
    }
    node.appendChild(inputs);
    node.appendChild(content);
    node.appendChild(outputs);
    //node.appendChild(properties);
    node.style.top = dataNode.pos_y + "px";
    node.style.left = dataNode.pos_x + "px";
    parent.appendChild(node);
    this.precanvas.appendChild(parent);
  }



  addRerouteImport(dataNode) {
    const reroute_width = this.reroute_width
    const reroute_fix_curvature = this.reroute_fix_curvature
    const container = this.container;
    Object.keys(dataNode.outputs).map(function(output_item, index) {
      Object.keys(dataNode.outputs[output_item].connections).map(function(input_item, index) {
        const points = dataNode.outputs[output_item].connections[input_item].points
        if(points !== undefined) {

          points.forEach((item, i) => {
            const input_id = dataNode.outputs[output_item].connections[input_item].node;
            const input_class = dataNode.outputs[output_item].connections[input_item].output;
            const ele = container.querySelector('.connection.node_in_node-'+input_id+'.node_out_node-'+dataNode.id+'.'+output_item+'.'+input_class);

            if(reroute_fix_curvature) {
              if(i === 0) {
                for (var z = 0; z < points.length; z++) {
                  var path = document.createElementNS('http://www.w3.org/2000/svg',"path");
                  path.classList.add("main-path");
                  path.setAttributeNS(null, 'd', '');
                  ele.appendChild(path);

                }
              }
            }

            const point = document.createElementNS('http://www.w3.org/2000/svg',"circle");
            point.classList.add("point");
            var pos_x = item.pos_x;
            var pos_y = item.pos_y;

            point.setAttributeNS(null, 'cx', pos_x);
            point.setAttributeNS(null, 'cy', pos_y);
            point.setAttributeNS(null, 'r', reroute_width);

            ele.appendChild(point);
          });
        };
      });
    });
  }

  updateNodeValue(event) {
    var attr = event.target.attributes
    for (var i = 0; i < attr.length; i++) {
            if (attr[i].nodeName.startsWith('df-')) {
                var keys = attr[i].nodeName.slice(3).split("-");
                var target = this.drawflow.drawflow[this.module].data[event.target.closest(".drawflow_content_node").parentElement.id.slice(5)].data;
                for (var index = 0; index < keys.length - 1; index += 1) {
                    if (target[keys[index]] == null) {
                        target[keys[index]] = {};
                    }
                    target = target[keys[index]];
                }
                target[keys[keys.length - 1]] = event.target.value;
                if(event.target.isContentEditable) {
                  target[keys[keys.length - 1]] = event.target.innerText;
                }
                this.dispatch('nodeDataChanged', event.target.closest(".drawflow_content_node").parentElement.id.slice(5));
          }
    }
  }

  updateNodeDataFromId(id, data) {
    var moduleName = this.getModuleFromNodeId(id)
    this.drawflow.drawflow[moduleName].data[id].data = data;
    if(this.module === moduleName) {
      const content = this.container.querySelector('#node-'+id);

      Object.entries(data).forEach(function (key, value) {
        if(typeof key[1] === "object") {
          insertObjectkeys(null, key[0], key[0]);
        } else {
          var elems = content.querySelectorAll('[df-'+key[0]+']');
            for(var i = 0; i < elems.length; i++) {
              elems[i].value = key[1];
              if(elems[i].isContentEditable) {
                elems[i].innerText = key[1];
              }
            }
        }
      })

      function insertObjectkeys(object, name, completname) {
        if(object === null) {
          var object = data[name];
        } else {
          var object = object[name]
        }
        if(object !== null) {
          Object.entries(object).forEach(function (key, value) {
            if(typeof key[1] === "object") {
              insertObjectkeys(object, key[0], completname+'-'+key[0]);
            } else {
              var elems = content.querySelectorAll('[df-'+completname+'-'+key[0]+']');
                for(var i = 0; i < elems.length; i++) {
                  elems[i].value = key[1];
                  if(elems[i].isContentEditable) {
                    elems[i].innerText = key[1];
                  }
                }
            }
          });
        }
      }

    }
  }

  addNodeInput(id) {
    var moduleName = this.getModuleFromNodeId(id)
    const infoNode = this.getNodeFromId(id)
    const numInputs = Object.keys(infoNode.inputs).length;
    if(this.module === moduleName) {
      //Draw input
      const input = document.createElement('div');
      input.classList.add("input");
      input.classList.add("input_"+(numInputs+1));
      const parent = this.container.querySelector('#node-'+id+' .inputs');
      parent.appendChild(input);
      this.updateConnectionNodes('node-'+id);

    }
    this.drawflow.drawflow[moduleName].data[id].inputs["input_"+(numInputs+1)] = { "connections": []};
  }

  addNodeOutput(id) {
    var moduleName = this.getModuleFromNodeId(id)
    const infoNode = this.getNodeFromId(id)
    const numOutputs = Object.keys(infoNode.outputs).length;
    if(this.module === moduleName) {
      //Draw output
      const output = document.createElement('div');
      output.classList.add("output");
      output.classList.add("output_"+(numOutputs+1));
      const parent = this.container.querySelector('#node-'+id+' .outputs');
      parent.appendChild(output);
      this.updateConnectionNodes('node-'+id);

    }
    this.drawflow.drawflow[moduleName].data[id].outputs["output_"+(numOutputs+1)] = { "connections": []};
  }

  removeNodeInput(id, input_class) {
    var moduleName = this.getModuleFromNodeId(id)
    const infoNode = this.getNodeFromId(id)
    if(this.module === moduleName) {
      this.container.querySelector('#node-'+id+' .inputs .input.'+input_class).remove();
    }
    const removeInputs = [];
    Object.keys(infoNode.inputs[input_class].connections).map(function(key, index) {
      const id_output = infoNode.inputs[input_class].connections[index].node;
      const output_class = infoNode.inputs[input_class].connections[index].input;
      removeInputs.push({id_output, id, output_class, input_class})
    })
    // Remove connections
    removeInputs.forEach((item, i) => {
      this.removeSingleConnection(item.id_output, item.id, item.output_class, item.input_class);
    });

    delete this.drawflow.drawflow[moduleName].data[id].inputs[input_class];

    // Update connection
    const connections = [];
    const connectionsInputs = this.drawflow.drawflow[moduleName].data[id].inputs
    Object.keys(connectionsInputs).map(function(key, index) {
      connections.push(connectionsInputs[key]);
    });
    this.drawflow.drawflow[moduleName].data[id].inputs = {};
    const input_class_id = input_class.slice(6);
    let nodeUpdates = [];
    connections.forEach((item, i) => {
      item.connections.forEach((itemx, f) => {
        nodeUpdates.push(itemx);
      });
      this.drawflow.drawflow[moduleName].data[id].inputs['input_'+ (i+1)] = item;
    });
    nodeUpdates =  new Set(nodeUpdates.map(e => JSON.stringify(e)));
    nodeUpdates = Array.from(nodeUpdates).map(e => JSON.parse(e));

    if(this.module === moduleName) {
      const eles = this.container.querySelectorAll("#node-"+id +" .inputs .input");
      eles.forEach((item, i) => {
        const id_class = item.classList[1].slice(6);
        if(parseInt(input_class_id) < parseInt(id_class)) {
          item.classList.remove('input_'+id_class);
          item.classList.add('input_'+(id_class-1));
        }
      });

    }

    nodeUpdates.forEach((itemx, i) => {
      this.drawflow.drawflow[moduleName].data[itemx.node].outputs[itemx.input].connections.forEach((itemz, g) => {
          if(itemz.node == id) {
            const output_id = itemz.output.slice(6);
            if(parseInt(input_class_id) < parseInt(output_id)) {
              if(this.module === moduleName) {
                const ele = this.container.querySelector(".connection.node_in_node-"+id+".node_out_node-"+itemx.node+"."+itemx.input+".input_"+output_id);
                ele.classList.remove('input_'+output_id);
                ele.classList.add('input_'+(output_id-1));
              }
              if(itemz.points) {
                  this.drawflow.drawflow[moduleName].data[itemx.node].outputs[itemx.input].connections[g] = { node: itemz.node, output: 'input_'+(output_id-1), points: itemz.points }
              } else {
                  this.drawflow.drawflow[moduleName].data[itemx.node].outputs[itemx.input].connections[g] = { node: itemz.node, output: 'input_'+(output_id-1)}
              }
            }
          }
      });
    });
    this.updateConnectionNodes('node-'+id);
  }

  addNodeProperties(nodeData){
    let nodeId=nodeData[1].value;
    this.drawflow.drawflow[this.module].data[nodeId].properties=[];
    for (let i=0; i<nodeData.length; i++) {
      switch(nodeData[i].name){
        case 'nodeName':
          this.drawflow.drawflow[this.module].data[nodeId].name=nodeData[i].value;
          this.drawflow.drawflow[this.module].data[nodeId].html=`<div class="title-box">${nodeData[i].value}</div>`;
          break;
        case 'namespace':
          this.drawflow.drawflow[this.module].data[nodeId].namespace=nodeData[i].value;
          break;
        case 'type':
          this.drawflow.drawflow[this.module].data[nodeId].type=nodeData[i].value;
          break;
        case 'provider':
          this.drawflow.drawflow[this.module].data[nodeId].provider=nodeData[i].value;
          break;
        case 'location':
          this.drawflow.drawflow[this.module].data[nodeId].location=nodeData[i].value;
          break;
        case 'key':
          console.log(i,nodeData[i].value,nodeData[i+1].value);
          this.drawflow.drawflow[this.module].data[nodeId].properties.push({'key':nodeData[i].value,'value':nodeData[i+1].value});
          break;
      }
    }
    this.precanvas.innerHTML = "";
    this.load();
  }

  addPipeProperties(pipeData){
    console.log(pipeData);

    this.drawflow.drawflow[this.module].data[pipeData.pipe.input_id].inputs[pipeData.pipe.input_class].connections = [];
    this.drawflow.drawflow[this.module].data[pipeData.pipe.output_id].outputs[pipeData.pipe.output_class].connections = [];

    this.drawflow.drawflow[this.module].data[pipeData.pipe.input_id].inputs[pipeData.pipe.input_class].connections.push({
          "node": pipeData.pipe.output_id,
          "input": pipeData.pipe.output_class,
          "type":pipeData.pipe.type
        });
    this.drawflow.drawflow[this.module].data[pipeData.pipe.output_id].outputs[pipeData.pipe.output_class].connections.push({
      "node": pipeData.pipe.input_id,
      "output": pipeData.pipe.input_class,
      "type":pipeData.pipe.type
    });
  }


  removeNodeOutput(id, output_class) {
    var moduleName = this.getModuleFromNodeId(id)
    const infoNode = this.getNodeFromId(id)
    if(this.module === moduleName) {
      this.container.querySelector('#node-'+id+' .outputs .output.'+output_class).remove();
    }
    const removeOutputs = [];
    Object.keys(infoNode.outputs[output_class].connections).map(function(key, index) {
      const id_input = infoNode.outputs[output_class].connections[index].node;
      const input_class = infoNode.outputs[output_class].connections[index].output;
      removeOutputs.push({id, id_input, output_class, input_class})
    })
    // Remove connections
    removeOutputs.forEach((item, i) => {
      this.removeSingleConnection(item.id, item.id_input, item.output_class, item.input_class);
    });

    delete this.drawflow.drawflow[moduleName].data[id].outputs[output_class];

    // Update connection
    const connections = [];
    const connectionsOuputs = this.drawflow.drawflow[moduleName].data[id].outputs
    Object.keys(connectionsOuputs).map(function(key, index) {
      connections.push(connectionsOuputs[key]);
    });
    this.drawflow.drawflow[moduleName].data[id].outputs = {};
    const output_class_id = output_class.slice(7);
    let nodeUpdates = [];
    connections.forEach((item, i) => {
      item.connections.forEach((itemx, f) => {
        nodeUpdates.push({ node: itemx.node, output: itemx.output });
      });
      this.drawflow.drawflow[moduleName].data[id].outputs['output_'+ (i+1)] = item;
    });
    nodeUpdates =  new Set(nodeUpdates.map(e => JSON.stringify(e)));
    nodeUpdates = Array.from(nodeUpdates).map(e => JSON.parse(e));

    if(this.module === moduleName) {
      const eles = this.container.querySelectorAll("#node-"+id +" .outputs .output");
      eles.forEach((item, i) => {
        const id_class = item.classList[1].slice(7);
        if(parseInt(output_class_id) < parseInt(id_class)) {
          item.classList.remove('output_'+id_class);
          item.classList.add('output_'+(id_class-1));
        }
      });

    }

    nodeUpdates.forEach((itemx, i) => {
      this.drawflow.drawflow[moduleName].data[itemx.node].inputs[itemx.output].connections.forEach((itemz, g) => {
          if(itemz.node == id) {
            const input_id = itemz.input.slice(7);
            if(parseInt(output_class_id) < parseInt(input_id)) {
              if(this.module === moduleName) {

                const ele = this.container.querySelector(".connection.node_in_node-"+itemx.node+".node_out_node-"+id+".output_"+input_id+"."+itemx.output);
                ele.classList.remove('output_'+input_id);
                ele.classList.remove(itemx.output);
                ele.classList.add('output_'+(input_id-1));
                ele.classList.add(itemx.output);
              }
              if(itemz.points) {
                  this.drawflow.drawflow[moduleName].data[itemx.node].inputs[itemx.output].connections[g] = { node: itemz.node, input: 'output_'+(input_id-1), points: itemz.points }
              } else {
                  this.drawflow.drawflow[moduleName].data[itemx.node].inputs[itemx.output].connections[g] = { node: itemz.node, input: 'output_'+(input_id-1)}
              }
            }
          }
      });
    });

    this.updateConnectionNodes('node-'+id);
  }

  removeNodeId(id) {
    this.removeConnectionNodeId(id);
    var moduleName = this.getModuleFromNodeId(id.slice(5))
    if(this.module === moduleName) {
      this.container.querySelector(`#${id}`).remove();
    }
    delete this.drawflow.drawflow[moduleName].data[id.slice(5)];
    this.dispatch('nodeRemoved', id.slice(5));
  }

  removeConnection() {
    if(this.connection_selected != null) {
      var listclass = this.connection_selected.parentElement.classList;
      this.connection_selected.parentElement.remove();
      //console.log(listclass);
      var index_out = this.drawflow.drawflow[this.module].data[listclass[2].slice(14)].outputs[listclass[3]].connections.findIndex(function(item,i) {
        return item.node === listclass[1].slice(13) && item.output === listclass[4]
      });
      this.drawflow.drawflow[this.module].data[listclass[2].slice(14)].outputs[listclass[3]].connections.splice(index_out,1);

      var index_in = this.drawflow.drawflow[this.module].data[listclass[1].slice(13)].inputs[listclass[4]].connections.findIndex(function(item,i) {
        return item.node === listclass[2].slice(14) && item.input === listclass[3]
      });
      this.drawflow.drawflow[this.module].data[listclass[1].slice(13)].inputs[listclass[4]].connections.splice(index_in,1);
      this.dispatch('connectionRemoved', { output_id: listclass[2].slice(14), input_id: listclass[1].slice(13), output_class: listclass[3], input_class: listclass[4] } );
      this.connection_selected = null;
    }
  }

  removeSingleConnection(id_output, id_input, output_class, input_class) {
    var nodeOneModule = this.getModuleFromNodeId(id_output);
    var nodeTwoModule = this.getModuleFromNodeId(id_input);
    if(nodeOneModule === nodeTwoModule) {
      // Check nodes in same module.

      // Check connection exist
      var exists = this.drawflow.drawflow[nodeOneModule].data[id_output].outputs[output_class].connections.findIndex(function(item,i) {
        return item.node == id_input && item.output === input_class
      });
      if(exists > -1) {

        if(this.module === nodeOneModule) {
          // In same module with view.
          this.container.querySelector('.connection.node_in_node-'+id_input+'.node_out_node-'+id_output+'.'+output_class+'.'+input_class).remove();
        }

        var index_out = this.drawflow.drawflow[nodeOneModule].data[id_output].outputs[output_class].connections.findIndex(function(item,i) {
          return item.node == id_input && item.output === input_class
        });
        this.drawflow.drawflow[nodeOneModule].data[id_output].outputs[output_class].connections.splice(index_out,1);

        var index_in = this.drawflow.drawflow[nodeOneModule].data[id_input].inputs[input_class].connections.findIndex(function(item,i) {
          return item.node == id_output && item.input === output_class
        });
        this.drawflow.drawflow[nodeOneModule].data[id_input].inputs[input_class].connections.splice(index_in,1);

        this.dispatch('connectionRemoved', { output_id: id_output, input_id: id_input, output_class:  output_class, input_class: input_class});
        return true;

      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  removeConnectionNodeId(id) {
    const idSearchIn = 'node_in_'+id;
    const idSearchOut = 'node_out_'+id;

    const elemsOut = this.container.querySelectorAll(`.${idSearchOut}`);
    for(var i = elemsOut.length-1; i >= 0; i--) {
      var listclass = elemsOut[i].classList;

      var index_in = this.drawflow.drawflow[this.module].data[listclass[1].slice(13)].inputs[listclass[4]].connections.findIndex(function(item,i) {
        return item.node === listclass[2].slice(14) && item.input === listclass[3]
      });
      this.drawflow.drawflow[this.module].data[listclass[1].slice(13)].inputs[listclass[4]].connections.splice(index_in,1);

      var index_out = this.drawflow.drawflow[this.module].data[listclass[2].slice(14)].outputs[listclass[3]].connections.findIndex(function(item,i) {
        return item.node === listclass[1].slice(13) && item.output === listclass[4]
      });
      this.drawflow.drawflow[this.module].data[listclass[2].slice(14)].outputs[listclass[3]].connections.splice(index_out,1);

      elemsOut[i].remove();

      this.dispatch('connectionRemoved', { output_id: listclass[2].slice(14), input_id: listclass[1].slice(13), output_class: listclass[3], input_class: listclass[4] } );
    }

    const elemsIn = this.container.querySelectorAll(`.${idSearchIn}`);
    for(var i = elemsIn.length-1; i >= 0; i--) {

      var listclass = elemsIn[i].classList;

      var index_out = this.drawflow.drawflow[this.module].data[listclass[2].slice(14)].outputs[listclass[3]].connections.findIndex(function(item,i) {
        return item.node === listclass[1].slice(13) && item.output === listclass[4]
      });
      this.drawflow.drawflow[this.module].data[listclass[2].slice(14)].outputs[listclass[3]].connections.splice(index_out,1);

      var index_in = this.drawflow.drawflow[this.module].data[listclass[1].slice(13)].inputs[listclass[4]].connections.findIndex(function(item,i) {
        return item.node === listclass[2].slice(14) && item.input === listclass[3]
      });
      this.drawflow.drawflow[this.module].data[listclass[1].slice(13)].inputs[listclass[4]].connections.splice(index_in,1);

      elemsIn[i].remove();

      this.dispatch('connectionRemoved', { output_id: listclass[2].slice(14), input_id: listclass[1].slice(13), output_class: listclass[3], input_class: listclass[4] } );
    }
  }

  getModuleFromNodeId(id) {
    var nameModule;
    const editor = this.drawflow.drawflow
    Object.keys(editor).map(function(moduleName, index) {
      Object.keys(editor[moduleName].data).map(function(node, index2) {
        if(node == id) {
          nameModule = moduleName;
        }
      })
    });
    return nameModule;
  }

  addModule(name) {
    this.drawflow.drawflow[name] =  { "data": {} };
    this.dispatch('moduleCreated', name);
  }
  changeModule(name) {
    this.dispatch('moduleChanged', name);
    this.module = name;
    this.precanvas.innerHTML = "";
    this.canvas_x = 0;
    this.canvas_y = 0;
    this.pos_x = 0;
    this.pos_y = 0;
    this.mouse_x = 0;
    this.mouse_y = 0;
    this.zoom = 1;
    this.zoom_last_value = 1;
    this.precanvas.style.transform = '';
    this.import(this.drawflow, false);
  }

  removeModule(name) {
    if(this.module === name) {
      this.changeModule('Home');
    }
    delete this.drawflow.drawflow[name];
    this.dispatch('moduleRemoved', name);
  }

  clearModuleSelected() {
    this.precanvas.innerHTML = "";
    this.drawflow.drawflow[this.module] =  { "data": {} };
  }

  clear () {
    this.precanvas.innerHTML = "";
    this.drawflow = { "drawflow": { "Home": { "data": {} }}};
  }
  export () {
    console.log('export');
    //const dataExport = JSON.parse(JSON.stringify(this.drawflow));
    let xmlData=this.convertJSONToXML(this.drawflow);
    this.dispatch('export', xmlData);
    return xmlData;
  }

  import (data, notifi = true) {
    this.clear();
    this.drawflow = JSON.parse(JSON.stringify(data));
    //let convertedData=this.convertXmlToJSON(data);
    this.load();
    if(notifi) {
      this.dispatch('import', 'import');
    }
  }

  convertXmlToJSON(dataXML){
    let dataJson=this.drawflow;
    let data={};
    if(dataXML!=null){
      let elements=dataXML.firstChild.childNodes;
      for(let i=0; i<elements.length;i++){
        if(elements[i].nodeName!="Pipes"){
          let childNodes=elements[i].childNodes;
          for(let j=0; j<childNodes.length;j++){
            let item_id=0;
            let subchildNodes=childNodes[j].childNodes;
            let objElements={properties:[]};
            let typeSplit=(childNodes[j].getAttribute('type'));
            let lastIndex=typeSplit.lastIndexOf(':');
            objElements['namespace']=typeSplit.slice(0,lastIndex);
            objElements['type']=typeSplit.slice(lastIndex+1);
            objElements['provider']=childNodes[j].getAttribute('provider');
            objElements['location']=childNodes[j].getAttribute('location');
            for(let k=0;k<subchildNodes.length;k++){
              switch(subchildNodes[k].nodeName){
                case 'inputs':
                case 'outputs':
                  if(Object.keys(subchildNodes[k].firstChild.childNodes).length>0){
                    objElements[subchildNodes[k].nodeName]=JSON.parse(subchildNodes[k].firstChild.innerHTML);
                  }
                  else{
                    objElements[subchildNodes[k].nodeName]=JSON.parse(subchildNodes[k].innerHTML);
                  }
                  break;
                case 'properties':
                  let props=subchildNodes[k].childNodes;
                  for(let l=0;l<props.length;l++){
                    objElements["properties"].push({"key":props[l].childNodes[0].innerHTML,"value":props[l].childNodes[1].innerHTML});
                  }
                  break;
                case 'typenode':
                  objElements[subchildNodes[k].nodeName]= subchildNodes[k].innerHTML==="true";
                  break;
                case 'pos_x':
                case 'pos_y':
                  objElements[subchildNodes[k].nodeName]= parseInt(subchildNodes[k].innerHTML);
                  break;
                case 'id':
                  item_id= parseInt(subchildNodes[k].innerHTML);
                  objElements[subchildNodes[k].nodeName]= parseInt(subchildNodes[k].innerHTML);
                  break;
                default:
                  objElements[subchildNodes[k].nodeName]=subchildNodes[k].innerHTML;
              }

            }
            data[item_id]=objElements;
          }
        }
      }

      dataJson['drawflow']['Home']['data']=data;
    }
    return dataJson;

  }

  convertJSONToXML(data){
    let doc = document.implementation.createDocument("", "", null);
    let headTag = doc.createElement("DataflowModel");
    let filterTag=doc.createElement("Filters");
    let inputTag=doc.createElement("Inputs");
    let outputTag=doc.createElement("Outputs");
    let pipeTag=doc.createElement("Pipes");
    let namespace = (store.getters.GetNamespace).Namespace;
    for(let i=0;i<namespace.length;i++){
      debugger;
      headTag.setAttribute(`xmlns:${namespace[i].id}`,namespace[i].name);
    }
    headTag.setAttribute("id","");
    let innerData=data['drawflow']['Home']['data'];
    let nodeId={};
    let pipeData=[];
    let pipeCount=0;
    for(let item in innerData){
      debugger;
      nodeId[parseInt(innerData[item]['id'])]=innerData[item]['name'];
      let subTag = doc.createElement(innerData[item]['class']);
      subTag.setAttribute("id",innerData[item]['name']);
      subTag.setAttribute("type",innerData[item]['type'] ? innerData[item]['namespace']+':'+innerData[item]['type']:"");
      subTag.setAttribute("location",innerData[item]['location']);
      subTag.setAttribute("provider",innerData[item]['provider']);
      for(let key in innerData[item]){
        let childTag=doc.createElement(key);
        switch(key){
          case 'inputs':
            if(Object.keys(innerData[item][key]).length){
              let inConnection=innerData[item][key]['input_1']['connections'];
              for(let key in inConnection){
                let found= pipeData.some(el=>(el.source=== parseInt(inConnection[key]['node']) && el.target === parseInt(innerData[item]['id'])));
                if(!found){
                  pipeCount+=1;
                  pipeData.push({'id':pipeCount,'source':parseInt(inConnection[key]['node']),'target':parseInt(innerData[item]['id']), 'type': inConnection[key]['type']});
                }
              }
            }

            childTag.innerHTML =JSON.stringify(innerData[item][key]);
            break;
          case 'outputs':
            if(Object.keys(innerData[item][key]).length){
              let outConnection=innerData[item][key]['output_1']['connections'];
              for(let key in outConnection){
                let found= pipeData.some(el=>(el.source===parseInt(innerData[item]['id']) && el.target===parseInt(outConnection[key]['node'])));
                if(!found){
                  pipeCount+=1;
                  pipeData.push({'id':pipeCount,'source':parseInt(innerData[item]['id']),'target':parseInt(outConnection[key]['node']),'type': outConnection[key]['type']});
                }
              }
            }
            childTag.innerHTML =JSON.stringify(innerData[item][key]);
            break;
          case 'data':
            childTag.innerHTML =JSON.stringify(innerData[item][key]);
            break;
          case 'properties':
            for(let ip in innerData[item][key]){
              let entryTag=doc.createElement("entry");
              let keyTag=doc.createElement("key");
              let valueTag=doc.createElement("value");
              keyTag.innerHTML=innerData[item][key][ip]['key'];
              valueTag.innerHTML = innerData[item][key][ip]['value'];
              entryTag.appendChild(keyTag);
              entryTag.appendChild(valueTag);
              childTag.appendChild(entryTag);
            }
            break;
          case 'namespace':
          case 'type':
          case 'provider':
          case 'location':
            continue;
            break;
          default:
            childTag.innerHTML =innerData[item][key];
            break;
        }
        subTag.appendChild(childTag);
        switch(innerData[item]['class']){
          case 'input':
            inputTag.appendChild(subTag);
            break;
          case 'output':
            outputTag.appendChild(subTag);
            break;
          case 'filter':
            filterTag.appendChild(subTag);
            break;
        }
      }

    }
    pipeData.forEach(function (pipe){
      let innerPipeTag=doc.createElement("Pipe");
      let sourceTag=doc.createElement("Source");
      let targetTag=doc.createElement("Target");
      innerPipeTag.setAttribute('id','Pipe'+pipe.id);
      innerPipeTag.setAttribute('dataTransferType', pipe.type);
      sourceTag.innerHTML=nodeId[pipe.source];
      targetTag.innerHTML=nodeId[pipe.target];
      innerPipeTag.appendChild(sourceTag);
      innerPipeTag.appendChild(targetTag);
      pipeTag.appendChild(innerPipeTag);
    });

    headTag.appendChild(inputTag);
    headTag.appendChild(outputTag);
    headTag.appendChild(filterTag);
    headTag.appendChild(pipeTag);
    doc.appendChild(headTag);
    let xmlData = new XMLSerializer().serializeToString(doc);
    return xmlData;

  }

  /* Events */
  on (event, callback) {
       // Check if the callback is not a function
       if (typeof callback !== 'function') {
           console.error(`The listener callback must be a function, the given type is ${typeof callback}`);
           return false;
       }
       // Check if the event is not a string
       if (typeof event !== 'string') {
           console.error(`The event name must be a string, the given type is ${typeof event}`);
           return false;
       }
       // Check if this event not exists
       if (this.events[event] === undefined) {
           this.events[event] = {
               listeners: []
           }
       }
       this.events[event].listeners.push(callback);
   }

   removeListener (event, callback) {
      // Check if this event not exists

      if (!this.events[event]) return false

      const listeners = this.events[event].listeners
      const listenerIndex = listeners.indexOf(callback)
      const hasListener = listenerIndex > -1
      if (hasListener) listeners.splice(listenerIndex, 1)
   }

   dispatch (event, details) {
       // Check if this event not exists
       if (this.events[event] === undefined) {
           // console.error(`This event: ${event} does not exist`);
           return false;
       }
       this.events[event].listeners.forEach((listener) => {
           listener(details);
       });
   }

    getUuid() {
        // http://www.ietf.org/rfc/rfc4122.txt
        var s = [];
        var hexDigits = "0123456789abcdef";
        for (var i = 0; i < 36; i++) {
            s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
        }
        s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
        s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
        s[8] = s[13] = s[18] = s[23] = "-";

        var uuid = s.join("");
        return uuid;
    }
}
