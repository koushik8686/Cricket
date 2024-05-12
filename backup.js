const { default: mongoose } = require("mongoose")
const {matchschema}= require("./matchmodel")
const backupschema = matchschema 
const backkupmodel = mongoose.model("/backup" , backupschema)

module.exports = backkupmodel