function sendDataToServer(value) {
    fetch(`/match/<%= match.id %>/ball`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ value: value }) // Send the clicked value to the server
       
    })
    .then(response => {
        if (response.ok) {
            // Handle successful response from the server
            console.log('Data sent successfully:', value);
        } else {
            // Handle errors from the server
            console.error('Error sending data:', response.statusText);
        }
    })
    .catch(error => {
        // Handle network errors or other exceptions
        console.error('Error:', error);
    });
    
}
