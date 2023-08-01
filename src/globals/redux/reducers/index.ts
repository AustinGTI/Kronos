import {combineReducers} from "@reduxjs/toolkit";
import testReducer from "./testReducer";


const rootReducer = combineReducers({
    test:testReducer
});

export default rootReducer;