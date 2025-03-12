const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

require('dotenv').config();

const session = require('./config/session');
const routes = require('./routes/index');


const app = express();


app.set("views", path.join(__dirname, "/public/views"));
app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'public')));

app.use(session);
app.use(routes);


const host_port = process.env.HOST_PORT || 5000;




const { execSync } = require('child_process');

const clearPort = (port) => {
    try {
        const result = execSync(`netstat -ano | findstr :${port}`).toString();
        const lines = result.trim().split('\n');
        
        lines.forEach(line => {
            const parts = line.trim().split(/\s+/);
            const pid = parts[parts.length - 1];
        
            execSync(`taskkill /PID ${pid} /F`);
            console.log(`\x1b[32mSuccessfully killed process on port ${port} (PID: ${pid})\x1b[0m`);
        });
    } 
    catch (error) {
        console.error(`\x1b[31m[ERROR]\x1b[0m Failed to clear port ${port}`);
    }
};


clearPort(host_port);

app.listen(host_port, () => {
    console.log(`\x1b[37mHost has started!\x1b[0m`);
    console.log(`\x1b[45mWebpage running on http://localhost:${host_port}\x1b[0m`);
});