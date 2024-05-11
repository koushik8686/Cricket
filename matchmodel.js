const mongoose = require('mongoose')
const { playerschema } = require('./models')

const matchschema =  mongoose.Schema({
    overs:Number,
    team1:[{
        playername:String,
        playerid:String
    }],
    team2:[{
        playername:String,
        playerid:String
    }],
    team1_runs:Number,
    team2_runs:Number,
    team1_wickets:Number,
    team2_wickets:Number,
    team1_overs:Number,
    team2_overs:Number,
    winner:String,
    date:Date,
    team1_player_batting_stats:[{
        name:String,
        id:String,
        runs:Number,
        balls:Number,
        fours:Number,
        sixes:Number,
        strike_rate:Number,
        out_type:String,
        bowler_name:String,
        assist:String
    }],
    team2_player_batting_stats:[{
        name:String,
        id:String,
        runs:Number,
        balls:Number,
        fours:Number,
        sixes:Number,
        strike_rate:Number,
        out_type:String,
        bowler_name:String,
        assist:String
    }],
    team1_player_bowling_stats:[{
        name:String,
        runs:Number,
        id:String,
        balls:Number,
        fours:Number,
        sixes:Number,
        overs:Number,
        wickets:Number,
        econony:Number
    }],
    team2_player_bowling_stats:[{
        name:String,
        runs:Number,
        balls:Number,
        id:String,
        fours:Number,
        sixes:Number,
        overs:Number,
        wickets:Number,
        econony:Number
    }],
    t1:[playerschema],
    t2:[playerschema],
    date: {
        type: Date,
        default: Date.now
    }
})

const match = mongoose.model('match',matchschema)

module.exports = match