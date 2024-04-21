const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.post('/register', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const email = req.body.email;

    // You can handle registration logic here, like saving to a database
    
    // Respond with a simple message for now
    res.send('Registration successful!');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});