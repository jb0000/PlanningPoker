import WebSocket from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { leaveSession } from './lib/SessionLogic.js';
import { Updater } from './lib/updater.js';
import { communicationHandler } from './lib/communicationHandler.js';

//init websockets, helpers and state
const wss = new WebSocket.Server({ port: 8081 });
const updater = new Updater(wss);
let state = { users: {}, sessions: {} }

wss.on('connection', function connection(ws) {
    // every client gets an id
    let id = uuidv4();
    // make sure id is unique
    const ids = [...wss.clients].map(client => client.id);
    while (ids.includes(id))
        id = uuidv4();
    ws.id = id; // and assign

    // handle incoming messages
    // TODO: add a way to display errors (like session not available) to user
    ws.on('message', function incoming(message) {
       state = communicationHandler(state,ws,updater, message);
    });

    // kick user out of their session if the connection closes
    // TODO: add some time for the user to reconnect / store a session cookie in users browser
    ws.onclose = function () {
        state = leaveSession(state, ws.id);
    };

    console.log(`client ${ws.id} connected`)

});

console.log('server started');
