import { createStore } from 'vuex'

// Create a new store instance.
const store = createStore({
    state () {
        return {
            editor:null,
            mobileLastMove:null,
            mobileItemSelect:null,
            options:null,
            propertyData:{},
            nodeProperty:null
        }
    },
    mutations: {
        SetEditor(state,editor){
            state.editor=editor
        },
        SetMobileLastMove(state,mobileLastMove){
            state.mobileLastMove=mobileLastMove
        },
        SetMobileItemSelect(state,mobileItemSelect){
            state.mobileItemSelect=mobileItemSelect
        },
        SetPropertyData(state,data){
            if(state.propertyData[data.id]==null){
                state.propertyData[data.id]=[];
            }
            if(data.key!=null&&data.value!=null){
                state.propertyData[data.id].push({key:data.key,value:data.value});
            }
             console.log(state.propertyData);
        },
        RemovePropertyData(state,data){
            if(state.propertyData[data.id]!=null){
                for(let i=0;i<state.propertyData[data.id].length;i++){
                    if(state.propertyData[data.id][i].key==data.key){
                        state.propertyData[data.id].splice(i,1)
                    }
                }
            }
            console.log(state.propertyData);
        },
        SetNodeProp(state,node){
            state.nodeProperty=node
        }
        ,
        SetOptions(state,options){
            state.options=options
        }

    },
    getters:{
        GetEditor: function (state){
            return state.editor
        },
        GetMobileLastMove: function (state){
            return state.mobileLastMove
        },
        GetMobileItemSelect: function (state){
            return state.mobileItemSelect
        },
        GetNodeProp: function (state){
            return state.nodeProperty
        },
        GetOptions: function (state){
            return state.options
        }
    }
})

// const app = createApp({ /* your root component */ })

// Install the store instance as a plugin
// app.use(store)
export default store