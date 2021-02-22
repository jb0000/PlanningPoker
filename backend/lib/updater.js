import { getUsers } from './sessionInfo.js';
// updater class that wraps convenient functions to send updates to the right clients of a session
class Updater {

    // needs wss to get clients and send messages
    constructor(wss) {
        this.wss = wss;
    };

    // sends an update to every client in session
    sendUpdate = (state, session, update) => {
        [...this.wss.clients].filter(client => state.users[client.id] === session)
            .forEach(client => client.send(JSON.stringify(update)));
    }

    // builds a object for the update of session meta information
    buildSessionMeta = (state, session, userId) => {
        return {
            type: "sessionMeta", payload: {
                userCount: getUsers(state, session).length, // number of users in session
                owner: state.sessions[session].owner === userId  //Boolean if user is owner
            }
        }
    }

    // sends meta data update to every client
    sendMetaUpdate = (state, session) => {
        [...this.wss.clients].filter(client => state.users[client.id] === session)
            //we cannot use sendUpdate since every user gets a custom message regarding session ownership
            .forEach(client => client.send(JSON.stringify(this.buildSessionMeta(state, session, client.id))));
    }

    // send a task update to everybody but the owner of the session
    sendTaskUpdate = (state, session) => {
        try {
            [...this.wss.clients].filter(client => state.users[client.id] === session && state.sessions[session].owner !== client.id)
                .forEach(client => client.send(JSON.stringify({ type: "task", payload: state.sessions[session].task })));
        } catch (error) {
            console.log(error);
        }
    }
}

export { Updater };