import { getUsers } from './sessionInfo.js';
// these functions handle the core logic of the application
// all the sessionhandling is in here


const createSession = (state, user, keyGenerator) => {
    try {
        if (!user) return state;
        // generate unique session key
        let key = keyGenerator();
        //in case you win the lottery
        while (state.sessions[key]) key = keyGenerator();
        //session object with defaults
        state.sessions[key] = {
            owner: user,
            votes: {},
            task: ""
        }
        //add user to session
        state.users[user] = key;
        console.log(`user ${user} created session with key ${key}`);
    } catch (error) {
        console.log(error);
    }
    return state;
}

const deleteSession = (state, sessionKey) => {
    try {
        // clean all remaining users out of the session
        Object.entries(state.users).filter(([user, session]) => session === sessionKey).forEach(([user, session]) => delete state.users[user]);
        // delete session
        delete state.sessions[sessionKey];
        console.log(`session ${sessionKey} was deleted`);
    } catch (error) {
        console.log(error);
    }
    return state
}
const joinSession = (state, session, user) => {
    try {
        // add user to session
        if (state.sessions[session]) {
            state.users[user] = session;
            console.log(`user ${user} joined session ${session}`);
        }
    } catch (error) {
        console.log(error);
    }
    return state;
}
const leaveSession = (state, user) => {
    try {
        const session = state.users[user];
        // check if user has already voted and delete vote
        if (state.sessions[session] && state.sessions[session].votes)
            delete state.sessions[session].votes[user];
        // delete user from session
        delete state.users[user]
        console.log(`user ${user} left session`)
        // check if user was owner
        if (state.sessions[session] && state.sessions[session].owner === user) {
            // assign a new owner
            state.sessions[session].owner = getUsers(state, session)[0]; //first come first serve :)
            // if there are no users left in the session => delete the session
            if (!state.sessions[session].owner)
                state = deleteSession(state, session);
            else console.log(`user ${state.sessions[session].owner} is now owner of session ${session}`)
        }
    } catch (error) {
        console.log(error);
    }
    return state;
}

const castVote = (state, user, vote) => {
    try {
        // Nope is the key to redract a vote
        if (vote === "Nope") {
            // so delete vote from user
            delete state.sessions[state.users[user]].votes[user];
            console.log(`user ${user} retracted his vote`);
        } else {
            // save vote in session
            state.sessions[state.users[user]].votes[user] = vote;
            console.log(`user ${user} voted ${vote}`);
        }
    } catch (error) {
        console.log(error);
    }

    return state;
}

const updateTask = (state, user, task) => {
    try {
        const session = state.users[user];
        // check if user is really owner
        if (state.sessions[session].owner === user) {
            // update task
            state.sessions[session].task = task;
            //no logging because it spams
        } else {
            console.log(`user ${user} tried to change task without ownership`)
        }
    } catch (error) {
        console.log(error);
    }

    return state;
}

export { createSession, deleteSession, joinSession, leaveSession, castVote, updateTask }