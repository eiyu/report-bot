const { createStore } =  require('redux');

const db = {}

const addFile = (state) => (nextVal) => {
  return Object.assign({},state.value, nextVal)
}
// 
const reviewed = (state) => (nextVal) => {
  return state.value
}

function counterReducer(state = { value: db }, action) {
  switch (action.type) {
    case 'addFile':
      return { value: addFile(state)({[action.value.messageId]: action.value})  }
    case 'reviewed':
      return { value: reviewed(state)(action.value)  }
    default:
      return state
  }
}

let store = createStore(counterReducer)


module.exports = {store};