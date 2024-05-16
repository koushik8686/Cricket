app.get("/confirm/:match:id" ,async function (req , res) { 
    await Match.findById(req.params.match).then(async (match) => {
            // Update player match count for Team 1
            // await Promise.all(match.team1.map(async (player) => {
            //     const foundPlayer = await playermodel.findById(player.playerid);
            //     if (foundPlayer) {
            //         foundPlayer.matches++;
            //         await foundPlayer.save();
            //     }
            // }));
    
            // // Update player match count for Team 2
            // await Promise.all(match.team2.map(async (player) => {
            //     const foundPlayer = await playermodel.findById(player.playerid);
            //     if (foundPlayer) {
            //         foundPlayer.matches++;
            //         await foundPlayer.save();
            //     }
            // }));
            // await updatePlayerbatStats(match.team1_player_batting_stats);
            // await updatePlayerbatStats(match.team2_player_batting_stats);
            // await updatePlayerStats(match.team1_player_bowling_stats);
            // await updatePlayerStats(match.team2_player_bowling_stats);
            // res.redirect("/players")
            // Send response or perform additional operations
        });
    res.redirect("/players")
 })