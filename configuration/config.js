const mongoose = require("mongoose")

async function connectDb(){
   try{await mongoose.connect("mongodb://localhost:27017/referal")
    console.log("connection succesfull with database")} 
    catch(err){
        console.log("connection failed with database " , err)
    }

}
connectDb()