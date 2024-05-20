const mongoose = require("mongoose");
require('dotenv').config();

mongoose.connect(process.env.URL);
const {playermodel} = require("./models")

playermodel.find().then((arr)=>{
arr.forEach(player => {
    if (player.bowling.balls!=0) {
        player.bowling.economy = parseFloat(( player.bowling.runs *6/   player.bowling.balls).toFixed(2));
   player.save()
        console.log("updated");
    }
});

})