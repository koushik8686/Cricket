const mongoose = require("mongoose");

const playerschema = mongoose.Schema({
    name:String,
    matches:String,
    catches:String,
    batting:{
    runs:Number,
    ballsfaced:Number,
    innings:Number,
    fours:Number,
    sixes:Number,
    strikeRate:Number,
    average:Number,
    halfcenturies:Number,
    centuries:Number,},
    bowling:{
     balls:Number,
     wickets:Number,
     overs:Number,
     maidens:Number,
     runs:Number,
     wides:Number,
     noballs:Number,
     economy:Number,
    }
})

const playermodel = mongoose.model("players",playerschema); 

module.exports = {playermodel , playerschema};

