if (match.currentbowler.overs % 0.5 === 0 && match.currentbowler.overs % 1 !== 0) {
    match.currentbowler.overs += 0.5; // Increment by 0.1
} else {
    console.log(match.currentbowler.overs.toFixed(1)); // Logging the current overs with one decimal place
    match.currentbowler.overs = parseFloat((match.currentbowler.overs + 0.1).toFixed(1)); // Increment by 0.1 and round to one decimal place
}
