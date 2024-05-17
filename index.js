
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
            notouts:0
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
        },
        runouts:0
    })
    a.save()
    res.redirect("/addplayers")
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
            team1_name:req.body.t1,
            team2_name:req.body.t2,
            team1: team1Players.map(player => ({ playerid: player._id, playername: player.name })),
            team2: team2Players.map(player => ({ playerid: player._id, playername: player.name })),
            firstbatting: req.body.firstBatting,
            t1: team1Players,
            t2: team2Players,
            team1_runs: 0,
            team2_runs: 0,
            team1_wickets: 0,
            team2_wickets: 0,
            team1_overs: 0,
            team2_overs: 0,
            team1_player_batting_stats: [],
            team2_player_batting_stats: [],
            team1_player_bowling_stats: [],
            team2_player_bowling_stats: [],
            team1_overs_total: [],
            team2_overs_total: [],
            currentbatters: [],
            currentbowler:{}
        })
        await newMatch.save();
      res.redirect("/match/"+newMatch._id)
    } catch (err) {
        console.error('Error creating match:', err);
        res.status(500).send('Error creating match');
    }
});

app.get("/match/:id" , function (req , res) { 
    Match.findById(req.params.id).then((match)=>{
if (match.team1_overs==match.overs) {console.log(1);
    res.redirect(`/match/${req.params.id}/innings1`);
return
}
if (match.team1_wickets==match.team1.length) {
    console.log(2);
    res.redirect(`/match/${req.params.id}/innings1`);
    return 
}
        res.render("match" , {match:match})
    })
 })
 app.post("/match/:id/openers1", async function (req, res) {
    try {
        console.log(req.body);
        console.log(req.body.openers[0]);

        const o1 = await playermodel.findById(req.body.openers[0]);
        const o2 = await playermodel.findById(req.body.openers[1]);
        const match = await Match.findById(req.params.id);
        match.team1_player_batting_stats.push({
            name: o1.name,
            id: req.body.openers[0],
            runs: 0,
            balls: 0,
            fours: 0,
            sixes: 0,
            strike_rate: 0,
            out_type: " ",
            bowler_name: " ",
            assist: " "
        });
        match.team1_player_batting_stats.push({
            name: o2.name,
            id: req.body.openers[1],
            runs: 0,
            balls: 0,
            fours: 0,
            sixes: 0,
            strike_rate: 0,
            out_type: " ",
            bowler_name: " ",
            assist: " "
        });
    
        const o3 = await playermodel.findById(req.body.bowler);
        match.currentbowler={
            name:o3.name,
            runs:0,
            id:req.body.bowler,
            balls:0,
            fours:0,
            sixes:0,
            overs:0,
            wickets:0, 
            economy:0
        }
        match.team2_player_bowling_stats.push({
            name: o3.name,
            id: req.body.bowler,
            runs: 0,
            balls: 0,
            fours:0,
            sixes:0,
            overs:0,
            wickets:0,
            economy:0
        });

        match.currentbatters = [
            {
                name: o1.name,
                id: req.body.openers[0],
                runs: 0,
                balls: 0,
                fours: 0,
                sixes: 0,
            },
            {
                name: o2.name,
                id: req.body.openers[1],
                runs: 0,
                balls: 0,
                fours: 0,
                sixes: 0,
            }
        ];

        await match.save();
        // res.redirect("/match/" + req.params.id);
        res.redirect("/match/" + req.params.id);        
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

app.post("/match/:id/selectbowler", async function (req, res) {
    try {
        const match = await Match.findById(req.params.id);
        if (!match) {
            return res.status(404).send('Match not found');
        }

        const o1 = await playermodel.findById(req.body.bowler);
        if (!o1) {
            return res.status(404).send('Bowler not found');
        }

        // Check if the bowler is already the current bowler
        if (match.currentbowler && match.currentbowler.id === req.body.bowler) {
            return res.redirect(`/match/${req.params.id}`)
        }

        match.currentbowler = {
            name: o1.name,
            id: req.body.bowler,
            runs: 0,
            balls: 0,
            fours: 0,
            sixes: 0,
            overs: 0,
            wickets: 0,
            economy:0
        }

        // Check if the bowler is already in team2_player_bowling_stats
        const existingBowlerIndex = match.team2_player_bowling_stats.findIndex(player => player.id === req.body.bowler);
        if (existingBowlerIndex !== -1) {
            const existingBowler = match.team2_player_bowling_stats[existingBowlerIndex];
            match.currentbowler.runs = existingBowler.runs;
            match.currentbowler.balls = existingBowler.balls;
            match.currentbowler.fours = existingBowler.fours;
            match.currentbowler.sixes = existingBowler.sixes;
            match.currentbowler.overs = existingBowler.overs;
            match.currentbowler.wickets = existingBowler.wickets;
            match.currentbowler.economy = existingBowler.economy;
        } else {
            match.team2_player_bowling_stats.push({
                name: o1.name,
                id: req.body.bowler,
                runs: 0,
                balls: 0,
                fours: 0,
                sixes: 0,
                overs: 0,
                wickets: 0,
                economy: 0
            });
        }

        await match.save();
        res.redirect("/match/" + req.params.id);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});


app.get("/" , function (req , res) { 
    res.render("home")
 })

 app.post('/match/:matchId/ball', async (req, res) => {
    const matchId = req.params.matchId;
    const value = Number(req.body.value);
    Match.findById(matchId).then(async (match) => {
        if (value==-1) {
            const tempBatter = match.currentbatters[0];
            match.currentbatters[0] = match.currentbatters[1];
            match.currentbatters[1] = tempBatter;
            await match.save()
            return 
        } else{
        
        if (match.currentbowler.overs % 0.5 === 0 && match.currentbowler.overs % 1 !== 0) {
            match.currentbowler.overs += 0.5; // Increment by 0.1
        } else {
            match.currentbowler.overs = parseFloat((match.currentbowler.overs + 0.1).toFixed(1)); // Increment by 0.1 and round to one decimal place
        }
        
       var id =  match.currentbatters[0].id
       var id1 =  match.currentbowler.id
       console.log(match.currentbatters);
        match.currentbatters[0].balls += 1
        match.currentbatters[0].runs += value; // Increase runs for current bowler
        match.currentbowler.runs += value; // Increase runs for current bowler
        match.currentbowler.balls += 1
        if (value==4) {match.currentbatters[0].fours+=1; match.currentbowler.fours+=1   }
        if (value==6) {match.currentbatters[0].sixes+=1; match.currentbowler.sixes+=1}
        match.team2_player_bowling_stats.forEach(player => {
            if (player.id === id1) {
                player.runs += value; // Increase runs for the player with the matching ID
                player.balls += 1; // Increase balls for the player with the matching ID
                if (player.overs % 0.5 === 0 && player.overs % 1 !== 0) {
                    player.overs += 0.5; // Increment by 0.5
                } else {
                    player.overs = parseFloat((player.overs + 0.1).toFixed(1)); // Increment by 0.1 and round to one decimal place
                }
            }
        });
        match.team1_runs+=Number(value)
        if (match.team1_overs % 0.5 === 0 && match.team1_overs % 1 !== 0) {
            match.team1_overs += 0.5; // Increment by 0.1
            console.log("heeere");
            if (match.currentbatters[1].runs!==undefined) {
                console.log("ok");
           }
        } else {
            match.team1_overs = parseFloat((match.team1_overs + 0.1).toFixed(1)); // Increment by 0.1 and round to one decimal place
        }
        if (value==1 || value==3) {
            console.log(match.currentbatters[1].runs);
            if (match.currentbatters[1].runs !==undefined) {
                const tempBatter = match.currentbatters[0];
                match.currentbatters[0] = match.currentbatters[1];
                match.currentbatters[1] = tempBatter;
            } 
        }}
       await match.save()
    }) 
    // res.redirect("/match/"+req.params.matchId);
 await res.send("hlo")
});
app.post("/match/:matchId/extras/team1",function (req , res) { 
var extras = Number(req.body.extra)

Match.findById(req.params.matchId).then(function (match){
    if (req.body.type=="wd") {
     playermodel.findById(match.currentbowler.id).then((player)=>{
        if (player) {
            player.bowling.wides++
            player.save()
        }
     })
    }
    if (req.body.type=="nb") {
     playermodel.findById(match.currentbowler.id).then((player)=>{
        if (player) {
            player.bowling.noballs++
            player.save()
        }
     })
    }
    match.team1_runs+=extras
    match.currentbowler.runs += extras
    match.save();
})
res.send("hlo")
 })
 app.post("/match/:matchId/wicket", function (req, res) {
    console.log(req.body);
    Match.findById(req.params.matchId).then(async function (match) {
        if (match.team1_overs % 0.5 === 0 && match.team1_overs % 1 !== 0) {
            match.team1_overs += 0.5; // Increment by 0.1
            const tempBatter = match.currentbatters[0];
            match.currentbatters[0] = match.currentbatters[1];
            match.currentbatters[1] = tempBatter;
        } else {
            match.team1_overs = parseFloat((match.team1_overs + 0.1).toFixed(1)); // Increment by 0.1 and round to one decimal place
        }
        if (match.currentbowler.overs % 0.5 === 0 && match.currentbowler.overs % 1 !== 0) {
            match.currentbowler.overs += 0.5; // Increment by 0.1
        } else {
            match.currentbowler.overs = parseFloat((match.currentbowler.overs + 0.1).toFixed(1)); // Increment by 0.1 and round to one decimal place
        }
        if (req.body.type == "bowled") {
            match.team1_wickets += 1;
            console.log( match.currentbatters[0]);
            match.currentbatters[0].balls += 1
            console.log( match.currentbatters[0]);
            const currentBatterId = match.currentbatters[0].id;
            const currentBatterStats = match.team1_player_batting_stats.find(player => player.id === currentBatterId);
            currentBatterStats.runs = match.currentbatters[0].runs;
            currentBatterStats.balls = match.currentbatters[0].balls;
            console.log( match.currentbatters[0]);
            currentBatterStats.fours = match.currentbatters[0].fours;
            currentBatterStats.sixes = match.currentbatters[0].sixes;
            if (match.currentbatters[0].balls == 0) {
                currentBatterStats.strike_rate = 0;
            } else {
                currentBatterStats.strike_rate = parseFloat(((match.currentbatters[0].runs / match.currentbatters[0].balls) * 100).toFixed(2));
            }
            currentBatterStats.out_type = "bowled";
            currentBatterStats.bowler_name = match.currentbowler.name;
            match.currentbowler.wickets += 1;
            const bowler = match.team2_player_bowling_stats.find(player => player.id === match.currentbowler.id);
            if (bowler) {
                bowler.wickets += 1;
            }
            const nextBatsman = req.body.nextBatsman;
            const newBatsman = match.team1.find(player => player.playerid === nextBatsman);
            if (nextBatsman!="0") {
                match.currentbatters[0] = {
                    name: newBatsman.playername,
                    id: newBatsman.playerid,
                    runs: 0,
                    balls: 0,
                    fours: 0,
                    sixes: 0
                };
            const existingPlayerIndex = match.team1_player_batting_stats.findIndex(player => player.id === nextBatsman);
            if (existingPlayerIndex === -1) {
                match.team1_player_batting_stats.push({
                    name: newBatsman.playername,
                    id: nextBatsman,
                    runs: 0,
                    balls: 0,
                    fours: 0,
                    sixes: 0,
                    strike_rate: 0,
                    out_type: " ",
                    bowler_name: " ",
                    assist: " "
                });
            }}
            if (match.team1_wickets==match.team1.length-1) {
                match.currentbatters[0]=match.currentbatters[1]
                match.currentbatters[1]={};
            }
            await match.save();
            res.send("OK");
        }
        if (req.body.type == "runout") {
            console.log(req.body);
            match.team1_wickets += 1;

            const currentBatterId = match.currentbatters[0].id;
            const currentBatterStats = match.team1_player_batting_stats.find(player => player.id === currentBatterId);

            currentBatterStats.runs = match.currentbatters[0].runs;
            currentBatterStats.balls = match.currentbatters[0].balls;
            currentBatterStats.fours = match.currentbatters[0].fours;
            currentBatterStats.sixes = match.currentbatters[0].sixes;
            if (match.currentbatters[0].balls == 0) {
                currentBatterStats.strike_rate = 0;
            } else {
                currentBatterStats.strike_rate = parseFloat(((match.currentbatters[0].runs / match.currentbatters[0].balls) * 100).toFixed(2));
            }
            currentBatterStats.out_type = "run out";
            currentBatterStats.bowler_name = match.currentbowler.name;
            const assistPlayer = match.team2.find(player => player.playerid === req.body.runoutAssist);
            currentBatterStats.assist = assistPlayer.playername;
            playermodel.findById(req.body.runoutAssist).then((player) =>{player.runouts++;player.save()} )
            const nextBatsman = req.body.nextBatsman;
            const newBatsman = match.team1.find(player => player.playerid === nextBatsman);
            if (nextBatsman!="0") {
                match.currentbatters[0] = {
                    name: newBatsman.playername,
                    id: newBatsman.playerid,
                    runs: 0,
                    balls: 0,
                    fours: 0,
                    sixes: 0
                };
            const existingPlayerIndex = match.team1_player_batting_stats.findIndex(player => player.id === nextBatsman);
            if (existingPlayerIndex === -1) {
                match.team1_player_batting_stats.push({
                    name: newBatsman.playername,
                    id: nextBatsman,
                    runs: 0,
                    balls: 0,
                    fours: 0,
                    sixes: 0,
                    strike_rate: 0,
                    out_type: " ",
                    bowler_name: " ",
                    assist: " "
                });
            }}
            if (match.team1_wickets==match.team1.length-1) {
                match.currentbatters[0]=match.currentbatters[1]
                match.currentbatters[1]={};
            }
            await match.save();
            res.send("OK");
        }
        if (req.body.type == "catch") {
            console.log(req.body);
            match.team1_wickets += 1;
            match.currentbatters[0].balls += 1
            const currentBatterId = match.currentbatters[0].id;
            const currentBatterStats = match.team1_player_batting_stats.find(player => player.id === currentBatterId);
            currentBatterStats.runs = match.currentbatters[0].runs;
            currentBatterStats.balls = match.currentbatters[0].balls;
            currentBatterStats.fours = match.currentbatters[0].fours;
            currentBatterStats.sixes = match.currentbatters[0].sixes;
            if (match.currentbatters[0].balls == 0) {
                currentBatterStats.strike_rate = 0;
            } else {
                currentBatterStats.strike_rate = parseFloat(((match.currentbatters[0].runs / match.currentbatters[0].balls) * 100).toFixed(2));
            }
            currentBatterStats.out_type = "caught";
            currentBatterStats.bowler_name = match.currentbowler.name;
            match.currentbowler.wickets += 1;
            const bowler = match.team2_player_bowling_stats.find(player => player.id === match.currentbowler.id);
            if (bowler) {
                bowler.wickets += 1;
            }
            const assistPlayer = match.team2.find(player => player.playerid === req.body.caughtBy);
            currentBatterStats.assist = assistPlayer.playername;
            playermodel.findById(req.body.caughtBy).then((player) =>{player.catches++;player.save()} )
            const nextBatsman = req.body.nextBatsman;
            const newBatsman = match.team1.find(player => player.playerid === nextBatsman);
            if (nextBatsman!="0") {
                match.currentbatters[0] = {
                    name: newBatsman.playername,
                    id: newBatsman.playerid,
                    runs: 0,
                    balls: 0,
                    fours: 0,
                    sixes: 0
                };
            const existingPlayerIndex = match.team1_player_batting_stats.findIndex(player => player.id === nextBatsman);
            if (existingPlayerIndex === -1) {
                match.team1_player_batting_stats.push({
                    name: newBatsman.playername,
                    id: nextBatsman,
                    runs: 0,
                    balls: 0,
                    fours: 0,
                    sixes: 0,
                    strike_rate: 0,
                    out_type: " ",
                    bowler_name: " ",
                    assist: " "
                });
            }}
            if (match.team1_wickets==match.team1.length-1) {
                match.currentbatters[0]=match.currentbatters[1]
                match.currentbatters[1]={};
            }
            await match.save();
            res.send("OK");
        }
    })
});
app.post("/match/:matchid/retire", async (req, res) => {
     await Match.findById(req.params.matchid).then(async (match)=>{
        const currentBatterId = match.currentbatters[0].id;
        // Find the index of the current batter in team1_player_batting_stats
        const currentBatterStatsIndex = match.team1_player_batting_stats.findIndex(player => player.playerid === currentBatterId);
        var newBatsman = {}
        match.team1.forEach(player => {
            if (player.playerid === req.body.nextbatsman) {
                newBatsman= player
            }
        });
        match.currentbatters[0] = {
            name: newBatsman.playername,
            id: newBatsman.playerid,
            runs: 0,
            balls: 0,
            fours: 0,
            sixes: 0
        };
        if (currentBatterStatsIndex !== -1) {
            // Update existing batter stats
            const currentBatterStats = match.team1_player_batting_stats[currentBatterStatsIndex];
            currentBatterStats.runs = match.currentbatters[0].runs;
            currentBatterStats.balls = match.currentbatters[0].balls;
            currentBatterStats.fours = match.currentbatters[0].fours;
            currentBatterStats.sixes = match.currentbatters[0].sixes;
            currentBatterStats.strike_rate = match.currentbatters[0].balls === 0 ? 0 : parseFloat(((match.currentbatters[0].runs / match.currentbatters[0].balls) * 100).toFixed(2));
            currentBatterStats.out_type = " ";
            currentBatterStats.bowler_name = " ";
            currentBatterStats.assist = " ";
        } else {
            // Add new batter stats if not exists
            match.team1_player_batting_stats.push({
                name: match.currentbatters[0].name,
                id: currentBatterId,
                runs: match.currentbatters[0].runs,
                balls: match.currentbatters[0].balls,
                fours: match.currentbatters[0].fours,
                sixes: match.currentbatters[0].sixes,
                strike_rate: match.currentbatters[0].balls === 0 ? 0 : parseFloat(((match.currentbatters[0].runs / match.currentbatters[0].balls) * 100).toFixed(2)),
                out_type: " ",
                bowler_name: " ",
                assist: " "
            });
        }

        await match.save();
        res.send("OK");
         });
   
})

app.get("/match/:match/innings1", async (req, res) => {
    console.log("YO");
    await Match.findById(req.params.match).then((match) => {
        match.team2_player_bowling_stats.forEach(player => {
            if (player.balls !== 0) {
                player.economy = parseFloat((player.runs / player.balls * 6).toFixed(2));
            } else {
                player.economy = 0; // or any default value you prefer when balls is zero
            }
                    });
        match.currentbatters.forEach(currentBatter => {
            if (currentBatter.runs) {
                console.log(currentBatter);
                let playerStats = match.team1_player_batting_stats.find(player => player.id === currentBatter.id);
                if (playerStats) {
                    playerStats.runs = currentBatter.runs;
                    playerStats.balls = currentBatter.balls;
                    playerStats.fours = currentBatter.fours;
                    playerStats.sixes = currentBatter.sixes;
                    playerStats.strike_rate = (currentBatter.balls > 0) ? parseFloat(((currentBatter.runs / currentBatter.balls) * 100).toFixed(2)) : 0;
                }    
      }        
        });
        match.save()
res.render("innings1", {match})
    })
})


app.get("/match/:id/innings2", function(req, res) {
    Match.findById(req.params.id).then((match)=>{
        if (match.team2_overs==match.overs) {
        //  res.send("Overs Completeed")
        res.redirect(`/match/${req.params.id}/scorecard`);
        return
        }
        if (match.team2_runs > match.team1_runs) {
            res.redirect(`/match/${req.params.id}/scorecard`);
        }
        if (match.team2_wickets==match.team2.length) {
            res.redirect(`/match/${req.params.id}/scorecard`);
            return 
        }
                res.render("match2" , {match:match})
            })
});
app.post("/match/:id/openers2", async function (req, res) {
    try {
        console.log(req.body);
        console.log(req.body.openers[0]);

        const o1 = await playermodel.findById(req.body.openers[0]);
        const o2 = await playermodel.findById(req.body.openers[1]);
        const match = await Match.findById(req.params.id);
        match. team2_player_batting_stats.push({
            name: o1.name,
            id: req.body.openers[0],
            runs: 0,
            balls: 0,
            fours: 0,
            sixes: 0,
            strike_rate: 0,
            out_type: " ",
            bowler_name: " ",
            assist: " "
        });
        match. team2_player_batting_stats.push({
            name: o2.name,
            id: req.body.openers[1],
            runs: 0,
            balls: 0,
            fours: 0,
            sixes: 0,
            strike_rate: 0,
            out_type: " ",
            bowler_name: " ",
            assist: " "
        });
    
        const o3 = await playermodel.findById(req.body.bowler);
        match.currentbowler={
            name:o3.name,
            runs:0,
            id:req.body.bowler,
            balls:0,
            fours:0,
            sixes:0,
            overs:0,
            wickets:0, 
            economy:0
        }
        match.team1_player_bowling_stats.push({
            name: o3.name,
            id: req.body.bowler,
            runs: 0,
            balls: 0,
            fours:0,
            sixes:0,
            overs:0,
            wickets:0,
            economy:0
        });

        match.currentbatters = [
            {
                name: o1.name,
                id: req.body.openers[0],
                runs: 0,
                balls: 0,
                fours: 0,
                sixes: 0,
            },
            {
                name: o2.name,
                id: req.body.openers[1],
                runs: 0,
                balls: 0,
                fours: 0,
                sixes: 0,
            }
        ];

        await match.save();
        // res.redirect("/match/" + req.params.id);
        res.redirect("/match/" + req.params.id+"/innings2");        
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});
app.post("/match/:id/team2/selectbowler", async function (req, res) {
    try {
        const match = await Match.findById(req.params.id);
        if (!match) {
            return res.status(404).send('Match not found');
        }

        const o1 = await playermodel.findById(req.body.bowler);
        if (!o1) {
            return res.status(404).send('Bowler not found');
        }

        // Check if the bowler is already the current bowler
        if (match.currentbowler && match.currentbowler.id === req.body.bowler) {
            return res.redirect(`/match/${req.params.id}/innings2`)
        }

        match.currentbowler = {
            name: o1.name,
            id: req.body.bowler,
            runs: 0,
            balls: 0,
            fours: 0,
            sixes: 0,
            overs: 0,
            wickets: 0,
            economy:0
        }

        // Check if the bowler is already in team1_player_bowling_stats
        const existingBowlerIndex = match.team1_player_bowling_stats.findIndex(player => player.id === req.body.bowler);
        if (existingBowlerIndex !== -1) {
            const existingBowler = match.team1_player_bowling_stats[existingBowlerIndex];
            match.currentbowler.runs = existingBowler.runs;
            match.currentbowler.balls = existingBowler.balls;
            match.currentbowler.fours = existingBowler.fours;
            match.currentbowler.sixes = existingBowler.sixes;
            match.currentbowler.overs = existingBowler.overs;
            match.currentbowler.wickets = existingBowler.wickets;
            match.currentbowler.economy = existingBowler.economy;
        } else {
            match.team1_player_bowling_stats.push({
                name: o1.name,
                id: req.body.bowler,
                runs: 0,
                balls: 0,
                fours: 0,
                sixes: 0,
                overs: 0,
                wickets: 0,
                economy: 0
            });
        }

        await match.save();
        res.redirect("/match/" + req.params.id+"/innings2");
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});
app.post('/match/:matchId/team2/ball', async (req, res) => {
    const matchId = req.params.matchId;
    const value = Number(req.body.value);
    Match.findById(matchId).then(async (match) => {
        if (value==-1) {
            const tempBatter = match.currentbatters[0];
            match.currentbatters[0] = match.currentbatters[1];
            match.currentbatters[1] = tempBatter;
            await match.save()
            return 
        } else{
            match.team2_runs+=Number(value)
        if (match.team2_overs % 0.5 === 0 && match.team2_overs % 1 !== 0) {
            match.team2_overs += 0.5; // Increment by 0.1
            console.log(match.currentbatters[1].runs);
        } else {
            match.team2_overs = parseFloat((match.team2_overs + 0.1).toFixed(1)); // Increment by 0.1 and round to one decimal place
        }
        if (match.currentbowler.overs % 0.5 === 0 && match.currentbowler.overs % 1 !== 0) {
            match.currentbowler.overs += 0.5; // Increment by 0.1
        } else {
            match.currentbowler.overs = parseFloat((match.currentbowler.overs + 0.1).toFixed(1)); // Increment by 0.1 and round to one decimal place
        }
        
       var id =  match.currentbatters[0].id
       var id1 =  match.currentbowler.id
       console.log(match.currentbatters);
        match.currentbatters[0].balls += 1
        match.currentbatters[0].runs += value; // Increase runs for current bowler
        match.currentbowler.runs += value; // Increase runs for current bowler
        match.currentbowler.balls += 1
        if (value==4) {match.currentbatters[0].fours+=1; match.currentbowler.fours+=1   }
        if (value==6) {match.currentbatters[0].sixes+=1; match.currentbowler.sixes+=1}
        match.team1_player_bowling_stats.forEach(player => {
            if (player.id === id1) {
                player.runs += value; // Increase runs for the player with the matching ID
                player.balls += 1; // Increase balls for the player with the matching ID
                if (player.overs % 0.5 === 0 && player.overs % 1 !== 0) {
                    player.overs += 0.5; // Increment by 0.5
                } else {
                    player.overs = parseFloat((player.overs + 0.1).toFixed(1)); // Increment by 0.1 and round to one decimal place
                }
            }
        });
        if (value==1 || value==3) {
            console.log(match.currentbatters[1].runs);
            if (match.currentbatters[1].runs !==undefined) {
                const tempBatter = match.currentbatters[0];
                match.currentbatters[0] = match.currentbatters[1];
                match.currentbatters[1] = tempBatter;
            } 
        }}
       await match.save()
    }) 
 await res.send("hlo")
});
app.post("/match/:matchId/extras/team2",function (req , res) { 
    var extras = Number(req.body.extra)
    Match.findById(req.params.matchId).then(function (match){
        if (req.body.type=="wd") {
            playermodel.findById(match.currentbowler.id).then((player)=>{
               if (player) {
                   player.bowling.wides++
                   console.log("added ed");
                   player.save()
               }
            })
           }
           if (req.body.type=="nb") {
            playermodel.findById(match.currentbowler.id).then((player)=>{
               if (player) {
                   player.bowling.noballs++
                   player.save()
               }
            })
           }
        match.team2_runs+=extras
        match.currentbowler.runs += extras
        match.save();
    })
    res.send("hlo")
})
app.post("/match/:matchId/team2/wicket", function (req, res) {
    console.log(req.body);
    Match.findById(req.params.matchId).then(async function (match) {
        if (match.team2_overs % 0.5 === 0 && match.team2_overs % 1 !== 0) {
            match.team2_overs += 0.5; // Increment by 0.1
            const tempBatter = match.currentbatters[0];
            match.currentbatters[0] = match.currentbatters[1];
            match.currentbatters[1] = tempBatter;
        } else {
            match.team2_overs = parseFloat((match.team2_overs + 0.1).toFixed(1)); // Increment by 0.1 and round to one decimal place
        }
        if (match.currentbowler.overs % 0.5 === 0 && match.currentbowler.overs % 1 !== 0) {
            match.currentbowler.overs += 0.5; // Increment by 0.1
        } else {
            match.currentbowler.overs = parseFloat((match.currentbowler.overs + 0.1).toFixed(1)); // Increment by 0.1 and round to one decimal place
        }
        if (req.body.type == "bowled") {
            match.team2_wickets += 1;
            const currentBatterId = match.currentbatters[0].id;
            const currentBatterStats = match.team2_player_batting_stats.find(player => player.id === currentBatterId);
            currentBatterStats.runs = match.currentbatters[0].runs;
            currentBatterStats.balls = match.currentbatters[0].balls;
            currentBatterStats.fours = match.currentbatters[0].fours;
            currentBatterStats.sixes = match.currentbatters[0].sixes;
            if (match.currentbatters[0].balls == 0) {
                currentBatterStats.strike_rate = 0;
            } else {
                currentBatterStats.strike_rate = parseFloat(((match.currentbatters[0].runs / match.currentbatters[0].balls) * 100).toFixed(2));
            }
            currentBatterStats.out_type = "bowled";
            currentBatterStats.bowler_name = match.currentbowler.name;
            match.currentbowler.wickets += 1;
            const bowler = match.team1_player_bowling_stats.find(player => player.id === match.currentbowler.id);
            if (bowler) {
                bowler.wickets += 1;
            }
            const nextBatsman = req.body.nextBatsman;
            const newBatsman = match.team2.find(player => player.playerid === nextBatsman);
            if (nextBatsman!="0") {
                match.currentbatters[0] = {
                    name: newBatsman.playername,
                    id: newBatsman.playerid,
                    runs: 0,
                    balls: 0,
                    fours: 0,
                    sixes: 0
                };
            const existingPlayerIndex = match.team2_player_batting_stats.findIndex(player => player.id === nextBatsman);
            if (existingPlayerIndex === -1) {
                match.team2_player_batting_stats.push({
                    name: newBatsman.playername,
                    id: nextBatsman,
                    runs: 0,
                    balls: 0,
                    fours: 0,
                    sixes: 0,
                    strike_rate: 0,
                    out_type: " ",
                    bowler_name: " ",
                    assist: " "
                });
            }}
            if (match.team2_wickets==match.team2.length-1) {
                match.currentbatters[0]=match.currentbatters[1]
                match.currentbatters[1]={};
            }
            await match.save();
            res.send("OK");
        }
        if (req.body.type == "runout") {
            console.log(req.body);
            match.team2_wickets += 1;

            const currentBatterId = match.currentbatters[0].id;
            const currentBatterStats = match.team2_player_batting_stats.find(player => player.id === currentBatterId);

            currentBatterStats.runs = match.currentbatters[0].runs;
            currentBatterStats.balls = match.currentbatters[0].balls;
            currentBatterStats.fours = match.currentbatters[0].fours;
            currentBatterStats.sixes = match.currentbatters[0].sixes;
            if (match.currentbatters[0].balls == 0) {
                currentBatterStats.strike_rate = 0;
            } else {
                currentBatterStats.strike_rate = parseFloat(((match.currentbatters[0].runs / match.currentbatters[0].balls) * 100).toFixed(2));
            }
            currentBatterStats.out_type = "run out";
            currentBatterStats.bowler_name = match.currentbowler.name;
            const assistPlayer = match.team1.find(player => player.playerid === req.body.runoutAssist);
            currentBatterStats.assist = assistPlayer.playername;
            playermodel.findById(req.body.runoutAssist).then((player) =>{player.runouts++;player.save()} )
            const nextBatsman = req.body.nextBatsman;
            const newBatsman = match.team2.find(player => player.playerid === nextBatsman);
            if (nextBatsman!="0") {
                match.currentbatters[0] = {
                    name: newBatsman.playername,
                    id: newBatsman.playerid,
                    runs: 0,
                    balls: 0,
                    fours: 0,
                    sixes: 0
                };
            const existingPlayerIndex = match.team2_player_batting_stats.findIndex(player => player.id === nextBatsman);
            if (existingPlayerIndex === -1) {
                match.team2_player_batting_stats.push({
                    name: newBatsman.playername,
                    id: nextBatsman,
                    runs: 0,
                    balls: 0,
                    fours: 0,
                    sixes: 0,
                    strike_rate: 0,
                    out_type: " ",
                    bowler_name: " ",
                    assist: " "
                });
            }}
            if (match.team2_wickets==match.team2.length-1) {
                match.currentbatters[0]=match.currentbatters[1]
                match.currentbatters[1]={};
            }
            await match.save();
            res.send("OK");
        }
        if (req.body.type == "catch") {
            console.log(req.body);
            match.team2_wickets += 1;

            const currentBatterId = match.currentbatters[0].id;
            const currentBatterStats = match.team2_player_batting_stats.find(player => player.id === currentBatterId);

            currentBatterStats.runs = match.currentbatters[0].runs;
            currentBatterStats.balls = match.currentbatters[0].balls;
            currentBatterStats.fours = match.currentbatters[0].fours;
            currentBatterStats.sixes = match.currentbatters[0].sixes;
            if (match.currentbatters[0].balls == 0) {
                currentBatterStats.strike_rate = 0;
            } else {
                currentBatterStats.strike_rate = parseFloat(((match.currentbatters[0].runs / match.currentbatters[0].balls) * 100).toFixed(2));
            }
            currentBatterStats.out_type = "caught";
            currentBatterStats.bowler_name = match.currentbowler.name;
            match.currentbowler.wickets += 1;
            const bowler = match.team1_player_bowling_stats.find(player => player.id === match.currentbowler.id);
            if (bowler) {
                bowler.wickets += 1;
            }
            const assistPlayer = match.team1.find(player => player.playerid === req.body.caughtBy);
            currentBatterStats.assist = assistPlayer.playername;
            playermodel.findById(req.body.caughtBy).then((player) =>{player.catches++;player.save()} )
            const nextBatsman = req.body.nextBatsman;
            const newBatsman = match.team2.find(player => player.playerid === nextBatsman);
            if (nextBatsman!="0") {
                match.currentbatters[0] = {
                    name: newBatsman.playername,
                    id: newBatsman.playerid,
                    runs: 0,
                    balls: 0,
                    fours: 0,
                    sixes: 0
                };
            const existingPlayerIndex = match.team2_player_batting_stats.findIndex(player => player.id === nextBatsman);
            if (existingPlayerIndex === -1) {
                match.team2_player_batting_stats.push({
                    name: newBatsman.playername,
                    id: nextBatsman,
                    runs: 0,
                    balls: 0,
                    fours: 0,
                    sixes: 0,
                    strike_rate: 0,
                    out_type: " ",
                    bowler_name: " ",
                    assist: " "
                });
            }}
            if (match.team2_wickets==match.team2.length-1) {
                match.currentbatters[0]=match.currentbatters[1]
                match.currentbatters[1]={};
            }
            await match.save();
            res.send("OK");
        }
    })
});
app.post("/match/:matchid/team2/retire", async (req, res) => {
    await Match.findById(req.params.matchid).then(async (match)=>{
       const currentBatterId = match.currentbatters[0].id;
       // Find the index of the current batter in team2_player_batting_stats
       const currentBatterStatsIndex = match.team2_player_batting_stats.findIndex(player => player.playerid === currentBatterId);
       var newBatsman = {}
       match.team2.forEach(player => {
           if (player.playerid === req.body.nextbatsman) {
               newBatsman= player
           }
       });
       match.currentbatters[0] = {
           name: newBatsman.playername,
           id: newBatsman.playerid,
           runs: 0,
           balls: 0,
           fours: 0,
           sixes: 0
       };
       if (currentBatterStatsIndex !== -1) {
           // Update existing batter stats
           const currentBatterStats = match.team2_player_batting_stats[currentBatterStatsIndex];
           currentBatterStats.runs = match.currentbatters[0].runs;
           currentBatterStats.balls = match.currentbatters[0].balls;
           currentBatterStats.fours = match.currentbatters[0].fours;
           currentBatterStats.sixes = match.currentbatters[0].sixes;
           currentBatterStats.strike_rate = match.currentbatters[0].balls === 0 ? 0 : parseFloat(((match.currentbatters[0].runs / match.currentbatters[0].balls) * 100).toFixed(2));
           currentBatterStats.out_type = " ";
           currentBatterStats.bowler_name = " ";
           currentBatterStats.assist = " ";
       } else {
           // Add new batter stats if not exists
           match.team2_player_batting_stats.push({
               name: match.currentbatters[0].name,
               id: currentBatterId,
               runs: match.currentbatters[0].runs,
               balls: match.currentbatters[0].balls,
               fours: match.currentbatters[0].fours,
               sixes: match.currentbatters[0].sixes,
               strike_rate: match.currentbatters[0].balls === 0 ? 0 : parseFloat(((match.currentbatters[0].runs / match.currentbatters[0].balls) * 100).toFixed(2)),
               out_type: " ",
               bowler_name: " ",
               assist: " "
           });
       }

       await match.save();
       res.send("OK");
        });
  
})
app.get("/match/:match/scorecard", async (req, res) => {
    await Match.findById(req.params.match).then((match) => {
        match.team1_player_bowling_stats.forEach(player => {
            if (player.balls !== 0) {
                player.economy = parseFloat((player.runs / player.balls * 6).toFixed(2));
            } else {
                player.economy = 0; // or any default value you prefer when balls is zero
            }
                    });
        match.currentbatters.forEach(currentBatter => {
            if (currentBatter.runs) {
                console.log(currentBatter);
                let playerStats = match.team2_player_batting_stats.find(player => player.id === currentBatter.id);
                if (playerStats) {
                    playerStats.runs = currentBatter.runs;
                    playerStats.balls = currentBatter.balls;
                    playerStats.fours = currentBatter.fours;
                    playerStats.sixes = currentBatter.sixes;
                    playerStats.strike_rate = (currentBatter.balls > 0) ? (currentBatter.runs / currentBatter.balls) * 100 : 0;
                }    
      }        
        });
        match.save()
res.render("scorecard", {match:match ,a:"ok" })
    })
})

app.get("/confirm/:matchid" ,async function (req , res) { 
     await Match.findById(req.params.matchid).then(async (match) => {
            await Promise.all(match.team1.map(async (player) => {
                const foundPlayer = await playermodel.findById(player.playerid);
                if (foundPlayer) {
                    foundPlayer.matches++;
                    await foundPlayer.save();
                }
            }));
    
            // Update player match count for Team 2
            await Promise.all(match.team2.map(async (player) => {
                const foundPlayer = await playermodel.findById(player.playerid);
                if (foundPlayer) {
                    foundPlayer.matches++;
                    await foundPlayer.save();
                }
            }));
            await updatePlayerbatStats(match.team1_player_batting_stats);
            await updatePlayerbatStats(match.team2_player_batting_stats);
            await updatePlayerStats(match.team1_player_bowling_stats);
            await updatePlayerStats(match.team2_player_bowling_stats);
        });
    res.redirect("/players")
 })
 async function updatePlayerStats(stats) {
    for (const playerStats of stats) {
        try {
            let player = await playermodel.findById(playerStats.id);
            if (player) {
                player.bowling.runs += playerStats.runs;
                player.bowling.balls += playerStats.balls;
                player.bowling.fours += playerStats.fours;
                player.bowling.sixes += playerStats.sixes;
                player.bowling.wickets += playerStats.wickets;
                if (playerStats.balls !== 0) {
                    player.bowling.economy = parseFloat((playerStats.runs / playerStats.balls * 6).toFixed(2));
                } else {
                    player.bowling.economy = 0; // or any default value you prefer when balls is zero
                }
                                // Update other statistics as needed
                await player.save();
            }
        } catch (error) {
            console.error("Error updating player stats:", error);
        }
    }
}
 async function updatePlayerbatStats(stats) {
    for (const playerStats of stats) {
       
            let player = await playermodel.findById(playerStats.id);
            if (player) {
                player.batting.innings++;
                player.batting.runs += playerStats.runs;
                player.batting.ballsfaced += playerStats.balls;
                player.batting.fours+= playerStats.fours;
                player.batting.sixes+= playerStats.sixes;
                if (player.batting.ballsfaced === 0) {
                    player.batting.strikeRate=0
                }else {
                    console.log(player.batting.runs ,player.batting.ballsfaced , player.name);
                    player.batting.strikeRate = parseFloat(((player.batting.runs / player.batting.ballsfaced) * 100).toFixed(2));
                    if (playerStats.runs>=50) {player.batting.halfcenturies++}
                if (playerStats.runs>=100) {player.batting.centuries++}
                if(playerStats.out_type==" "){player.batting.notouts++}
                if (player.batting.innings - player.batting.notouts!=0) {
                    console.log(player.batting.innings ,player.batting.notouts );
                    player.batting.average = player.batting.runs/(player.batting.innings - player.batting.notouts)
                }

                // Update other statistics as needed
                await player.save();
            }
        } 
    }
}
app.get("/:matchid/scorecard", function(req, res){
    Match.findById(req.params.matchid).then(match => {
        res.render("scorecard", {match:match ,a:"no" })
    })
})
app.get("/matches" , function(req , res){
    Match.find().then(matches => {
        res.render("matches", {matches:matches})
    })
})
 app.listen(3000 )
