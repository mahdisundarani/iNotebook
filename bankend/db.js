const mongoose = require('mongoose');

const mongoURI = "mongodb://localhost:27017/inotebook"
const connectToMongo = () =>{
    mongoose.connect(mongoURI)
    .then(()=>{
        console.log("Connection successfull")
        })
        .catch((err)=>{
        console.log("ERROR!!!")
        console.log(err)
        })
}

module.exports = connectToMongo;