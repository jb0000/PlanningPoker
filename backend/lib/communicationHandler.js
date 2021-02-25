import { castVote, createSession, joinSession, leaveSession, updateTask } from './SessionLogic.js';
import { getVotes } from './sessionInfo.js';
import { v4 as uuidv4 } from 'uuid';

const communicationHandler = (state, ws, updater, message) => {

    console.log(`message recieved from ${ws.id}`)
    console.log(message)

    // try and parse the message
    try {
        message = JSON.parse(message);
    } catch (error) {
        console.log(error);
    }
    // abort if there is no valid message
    if (!message || !message.command) return state;

    let session;
    switch (message.command) {
        case "createSession":
            state = createSession(state, ws.id, uuidv4); // create session and add user as owner
            session = state.users[ws.id];
            ws.send(JSON.stringify({ type: "sessionId", payload: session })) // send user sessionId
            ws.send(JSON.stringify(updater.buildSessionMeta(state, session, ws.id))) // send user session metadata
            break;
        case "joinSession":
            //error handling
            state = joinSession(state, message.payload, ws.id); // add user to session
            session = state.users[ws.id];
            if (session) {
                ws.send(JSON.stringify({ type: "sessionId", payload: session })); // send user sessionId
                ws.send(JSON.stringify({ type: "votes", payload: getVotes(state, session) })); // and votes
                ws.send(JSON.stringify({ type: "task", payload: state.sessions[session].task })); // and task
                updater.sendMetaUpdate(state, session); // update everybody's number of users in session
            }
            break;
        case "leaveSession":
            session = state.users[ws.id];
            state = leaveSession(state, ws.id); // remove user from session
            ws.send(JSON.stringify({ type: "sessionId", payload: undefined })); // send him update for sessionId
            updater.sendUpdate(state, session, { type: "votes", payload: getVotes(state, session) }); // update everybody's votes (since users got deleted)
            updater.sendMetaUpdate(state, session); // update everybody's new number of users in session
            break;
        case "castVote":
            session = state.users[ws.id];
            state = castVote(state, ws.id, message.payload); // add or update vote in session
            updater.sendUpdate(state, session, { type: "votes", payload: getVotes(state, session) }); // update all votes
            break;
        case "taskUpdate":
            // TODO: sanitize task input
            state = updateTask(state, ws.id, message.payload); // update task in session
            updater.sendTaskUpdate(state, state.users[ws.id]); // update everybody's task
            break;
    }
    return state
};

export { communicationHandler };