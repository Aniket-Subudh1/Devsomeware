import { createSlice } from '@reduxjs/toolkit'

// Define a type for the slice state
interface userState {
  name:string,
  email:string,
  github:string,
  linkedin:string,
  img:string,
  intrests:string[],
  languages:string,
  frameworks:string,
  isauth:boolean,
  bio:string,
  id:string;
}

// Define the initial state using that type
const initialState: userState = {
    name:"",
    email:"",
    github:"",
    linkedin:"",
    img:"",
    intrests:[],
    languages:"",
    frameworks:"",
    isauth:false,
    bio:"",
    id:"",
}

export const userSlice = createSlice({
  name: 'user',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
   add:(state,action)=>{
    state.name=action.payload.name
    state.email=action.payload.email
    state.github=action.payload.github
    state.linkedin=action.payload.linkedin
    state.img=action.payload.img
    state.intrests=action.payload.intrests
    state.languages=action.payload.languages
    state.frameworks=action.payload.frameworks
    state.isauth=action.payload.isauth
    state.bio=action.payload.bio
    state.id=action.payload.id
   },
  },
})

export const { add } = userSlice.actions;
export default userSlice;