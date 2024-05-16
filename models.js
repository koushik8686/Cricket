const mongoose = require("mongoose");

const playerschema = mongoose.Schema({
    name:String,
    matches:Number,
    catches:Number,
    runouts:Number,
    batting:{
    runs:Number,
    ballsfaced:Number,
    innings:Number,
    fours:Number,
    sixes:Number,
    notouts:Number,
    strikeRate:Number,
    average:Number,
    halfcenturies:Number,
    centuries:Number,},
    bowling:{
     balls:Number,
     wickets:Number,
     overs:Number,
     runs:Number,
     wides:Number,
     noballs:Number,
     economy:Number,
    },
})

const playermodel = mongoose.model("players",playerschema); 

module.exports = {playermodel , playerschema};

