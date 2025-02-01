import { createSlice } from '@reduxjs/toolkit'

// Define a type for the slice state
interface EventState {
 userid:string,
 eventid:string,
eventname:string,
ticketid:string,
email:string,
iszentrone:boolean,
}

// Define the initial state using that type
const initialState: EventState = {
    userid:"",
    eventid:"",
    eventname:"",
    ticketid:"",
    email:"",
    iszentrone:false,

}

export const EventSlice = createSlice({
  name: 'counter',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
   add:(state,action)=>{
    state.userid=action.payload.userid
    state.eventid=action.payload.eventid
    state.eventname=action.payload.eventname
    state.ticketid=action.payload.ticketid
    state.email=action.payload.email
    state.iszentrone=action.payload.iszentrone
   },
  },
})

export const { add  } = EventSlice.actions;
export default EventSlice;