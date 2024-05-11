const mongoose = require("mongoose");
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect("mongodb+srv://koushik:koushik@cluster0.h2lzgvs.mongodb.net/cricket");

const playerschema = mongoose.Schema({
    name:String,
    batting:{
    runs:Number,
    ballsfaced:Number,
    matches:Number,
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

app.get("/" , function(req , res){
    playermodel.find().then((arr)=>{
        res.render("index" ,{players:arr} );
    })
})

app.post("/addplayers" , function (req , res) { 
    console.log(req.body);
    const a = new playermodel({
        name:req.body.name,
        batting:{
            runs:0,
            ballsfaced:0,
            matches:0,
            fours:0,
            sixes:0,
            strikeRate:0,
            average:0,
            halfcenturies:0,
            centuries:0,
        } , 
        bowling:{
            balls:0,
            wickets:0,
            overs:0,
            maidens:0,
            runs:0,
            wides:0,
            noballs:0,
            economy:0,
        }
    })
    a.save()
    res.redirect("/")
 })

 app.listen(3000

 )