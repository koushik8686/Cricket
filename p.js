
const axios = require('axios');
const mongoose = require("mongoose");
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const {Match} = require("./matchmodel")
const backup = require("./backup");
require('dotenv').config();
app.set('view engine', 'ejs');
const {playermodel} = require("./models")
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect(process.env.URL);
const jsonParser = bodyParser.json();
app.use(jsonParser); // use it globally
var count=0

var batstats = []
var bowlstats = []
app.listen(4000);
app.get('/singlematchstats', function(req, res){
    let batstats = []; // Initialize the array before using it
    Match.find()
        .then(arr => {
            arr.forEach(element => {
                element.team1_player_batting_stats.forEach(stats => {
                    batstats.push({stats:stats , id:element._id});
                });
                element.team2_player_batting_stats.forEach(stats => {
                    batstats.push({stats:stats , id:element._id});
                });
                element.team1_player_bowling_stats.forEach(stats => {
                    bowlstats.push({stats:stats , id:element._id});
                });
                element.team2_player_bowling_stats.forEach(stats => {
                    bowlstats.push({stats:stats , id:element._id});
                });
            });
            console.log(batstats);
            res.render("a",{batstats , bowlstats}); // Send the array after the asynchronous operation is completed
        })
        .catch(err => {
            console.error(err);
            res.status(500).send('Internal Server Error');
        });
});
