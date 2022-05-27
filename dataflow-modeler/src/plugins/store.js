import { createStore } from 'vuex'

// Create a new store instance.
const store = createStore({
    state () {
        return {
            editor:null,
            mobileLastMove:null,
            mobileItemSelect:null
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
        }
    }
})

// const app = createApp({ /* your root component */ })

// Install the store instance as a plugin
// app.use(store)
export default store