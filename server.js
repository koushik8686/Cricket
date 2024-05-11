

const mongoose = require("mongoose");
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const Match = require("./matchmodel")
require('dotenv').config();
app.set('view engine', 'ejs');
const {playermodel} = require("./models")
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect(process.env.URL);


app.get("/addplayers" , function(req , res){
    playermodel.find().then((arr)=>{
        res.render("addplayer" ,{players:arr} );
    })
})
app.get("/player/:id" , function(req, res){
    playermodel.findById(req.params.id).then((player)=>{
        res.render("player" , {player:player})
    })
})
app.post("/addplayers" , function (req , res) { 
    console.log(req.body);
    const a = new playermodel({
        name:req.body.name,
        matches:0,
        catches:0,
        batting:{
            runs:0,
            ballsfaced:0,
            innings:0,
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

app.get("/players" ,  function (req , res) { 
    playermodel.find().then((arr)=>{
        res.render("players" , {players:arr})
    })
 })

app.get("/creatematch" ,  function (req , res) { 
 playermodel.find().then((arr)=>{
    res.render("creatematch" , {players:arr})
 })
 })
 app.post('/creatematch', async (req, res) => {
    try {
        // Fetch players' details based on the received IDs
        const team1Players = await playermodel.find({ _id: { $in: req.body.team1 } });
        const team2Players = await playermodel.find({ _id: { $in: req.body.team2 } });
        
        // Create new match with player details
        const newMatch = new Match({
            overs: req.body.overs,
            team1: team1Players.map(player => ({ playerid: player._id, playername: player.name })),
            team2: team2Players.map(player => ({ playerid: player._id, playername: player.name })),
            firstBatting: req.body.firstBatting,
            t1: team1Players,
            t2: team2Players
            // Include other fields based on your form data
        });

        await newMatch.save();
      res.redirect("/match/"+newMatch._id)
    } catch (err) {
        console.error('Error creating match:', err);
        res.status(500).send('Error creating match');
    }
});

app.get("/match/:id" , function (req , res) { 
    Match.findById(req.params.id).then((match)=>{
        res.render("match" , {match:match})
    })
 })

app.get("/" , function (req , res) { 
    res.render("home")
 })

 app.listen(3000 )