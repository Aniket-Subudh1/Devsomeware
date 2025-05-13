"use server"
import jwt from "jsonwebtoken";
const VerifyJwt = (token:string)=>{
try{
    let verifytoken = jwt.verify(token,process.env.JWT_SECRET as string);
    console.log(verifytoken);
    if(verifytoken){
        return {status:true,message:"Token is valid",data:verifytoken}
    }
    else{
        return {status:false,message:"Invalid Token"}
    }

}
catch(err){
    return {status:false,message:"Invalid Token"}
}
}
export default VerifyJwt;