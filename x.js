const axios = require('axios');
const { Match } = require('./matchmodel');

const url = 'http://localhost:3000/match/664afd5df36a150c9607e611/ball';
const url2 = 'http://localhost:3000/match/664afd5df36a150c9607e611/selectbowler';


async function sendRequest(j) {
    try {
        const payload = { value: j }; // Adjust the payload as needed
        const response = await axios.post(url, payload);
        console.log(`Request successful for attempt ${j}:`, response.data);
    } catch (error) {
        console.error(`Error with request for attempt ${j}:`, error.message);
    }
}
async function sendbRequest(j) {
    try {
        const payload = { bowler: j }; // Adjust the payload as needed
        // const response = await axios.post(url2, payload);
        console.log(`Request successful for attempt ${j}:`, response.data);
    } catch (error) {
        console.error(`Error with request for attempt ${j}:`, error.message);
    }
}

var j =0
var arr = ["66463610ce266b166811a822" ,"66463623ce266b166811a826","6646362fce266b166811a82a", "6646b3d952b651010de56c48" , "6646b40a52b651010de56c51" ]
async function sendRequestsRepeatedly(times) {
    const sequence = [0, 1, 2, 3, 4, 6];
    let j = 0;

    for (let i = 0; i < times; i++) {
        const j = Math.floor(Math.random() * sequence.length);
        await sendRequest(sequence[j]);
        // console.log(`Current value of j: ${sequence[j]}`);
     
    }
};
sendRequestsRepeatedly(120)
// sendRequest(1)
