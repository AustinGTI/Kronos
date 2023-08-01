import {createSlice} from "@reduxjs/toolkit";


const initial_state = {
    name: "test",
    age: 0
}

const testSlice = createSlice({
    name: 'test',
    initialState: initial_state,
    reducers: {
        setName: (state, action) => {
            state.name = action.payload
        },
        setAge: (state, action) => {
            state.age = action.payload
        }
    }
})


export const {setName, setAge} = testSlice.actions
export default testSlice.reducer