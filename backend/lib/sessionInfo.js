// helper functions to retrieve information from sessions
// get number of users connected to one session
const getUsers = (state, sessionKey) => {
    return Object.entries(state.users).filter(([_, session]) => session === sessionKey).map(([user, _]) => user);
}

// get all votes counted from one session
// to ensure anonymity, only the aggregate gets send out
const getVotes = (state, session) => {
    if (!state.sessions[session]) return {};
    return Object.values(state.sessions[session].votes).reduce((acc, val) => {
        if (acc[val]) acc[val] += 1;
        else acc[val] = 1;
        return acc;
    }, {})
}

export { getUsers, getVotes };