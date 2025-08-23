import { createStore, combineReducers, applyMiddleware } from 'redux';
import { thunk } from 'redux-thunk';

// Simple reducer for demonstration
const initialState = {
  user: null,
  verifications: [],
};

const appReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
      };
    case 'ADD_VERIFICATION':
      return {
        ...state,
        verifications: [...state.verifications, action.payload],
      };
    default:
      return state;
  }
};

const rootReducer = combineReducers({
  app: appReducer,
});

const store = createStore(rootReducer, applyMiddleware(thunk));

export default store;