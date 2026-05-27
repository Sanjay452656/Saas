import mongoose from 'mongoose'

const companySchema = new mongoose.Schema({
    company_name:{
        type:String,
        required:true
    },
    plan:{
        type:String,
        enum:["FREE","PRO","ENTERPRISE"],
        default:"FREE",
    }
},{timestamps:true})

export default mongoose.model("Company",companySchema);