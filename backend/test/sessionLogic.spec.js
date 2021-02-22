import { expect } from 'chai';
import { createSession, deleteSession, joinSession, leaveSession, castVote, updateTask} from '../lib/sessionLogic.js';

describe("SessionLogic", function () {
    const defaultState = { users: {}, sessions: {} };
    it("can create session", function () {
        const user = "testOwner";
        const testGenerator = () => "test";

        const state = createSession(defaultState, user, testGenerator);

        expect(state.sessions[testGenerator()]).to.deep.equal({ owner: user, votes: {}, task: "" })
        expect(state.users.testOwner).to.be.equal(testGenerator())
    });
    //TODO: test session key already existing
    it("create session ignores invalid input ", function () {

        const state = createSession(defaultState);

        expect(state).to.deep.equal(defaultState);
    });

    it("can delete session", function () {
        let state = { users: { testuser: "deleteMe", test: "testSession" }, sessions: { testSession: {}, deleteMe: {} } };
        state = deleteSession(state, "deleteMe");

        expect(state).to.deep.equal({ users: { test: "testSession" }, sessions: { testSession: {} } });
    });

    it("delete session ignores invalid input", function () {
        let state = { testSession: {} };
        state = deleteSession(state, "b");

        expect(state).to.deep.equal({ testSession: {} });
    });
    it("can join user in session", function () {
        let state = { sessions: { testSession: {} }, users: {} };
        const user = "testuser";

        state = joinSession(state, "testSession", user);

        expect(state.users.testuser).to.deep.equal("testSession");
    });
    it("join user ingnores invalid input", function () {

        const state = joinSession({ testSession: {} });

        expect(state.testSession).to.deep.equal({})
    });
    it("user can leave session", function () {
        let state = { users: { testuser: "testSession" }, sessions: { testSession: { owner: "o", votes: { test: 5 } } } };

        state = leaveSession(state, "testuser");

        expect(state.users).to.deep.equal({});
        expect(state.sessions.testSession.votes).to.deep.equal({ test: 5 });
    });
    it("user can leave session and it deletes vote", function () {
        let state = { users: { testuser: "testSession" }, sessions: { testSession: { owner: "o", votes: { testuser: 2, test: 5 } } } };

        state = leaveSession(state, "testuser");

        expect(state.users).to.deep.equal({});
        expect(state.sessions.testSession.votes).to.deep.equal({ test: 5 });
    });
    it("owner can leave session and new random owner gets appointed", function () {
        let state = {
            users: { testuser: "testSession", newBoss: "testSession" },
            sessions: {testSession: {owner:"testuser",votes: { testuser: 2, test: 5 } }}
        };
        state = leaveSession(state, "testuser");

        expect(state.users).to.deep.equal({ newBoss: "testSession" });
        expect(state.sessions.testSession.owner).to.deep.equal("newBoss");
    });
    it("delete Session if no ones left", function () {
        let state = { users: { testuser: "testSession" }, sessions: { testSession: { owner: "testuser", votes: { testuser: 2 } } } };

        state = leaveSession(state, "testuser");

        expect(state.users).to.deep.equal({});
        expect(state.sessions).to.be.empty;
    });
    it("leave Session ingnores invalid input", function () {
        const oldstate = { users: { testuser: "testSession" }, sessions: { testSession: { owner: "testuser", votes: { testuser: 2 } } } };

        const state = leaveSession(oldstate, "hahaha");
        expect(state).to.be.deep.equal(oldstate);
    });
    it("cast vote in Session", function () {
        let state = {users: {testVoter: "testSession"},sessions: { testSession: { votes: { testuser: 2 } } } };

        state = castVote(state, "testVoter",5);

        expect(state.sessions.testSession.votes).to.be.deep.equal({testuser: 2 , testVoter: 5});
    });
    it("cast ignores wrong input", function () {
        let state = {users: {testVoter: "hahaha"},sessions: { testSession: { } } };

        state = castVote(state, "testVoter",5);

        expect(state.sessions.testSession).to.be.deep.equal({});
    }); 
    it("change vote in Session", function () {
        let state = {users: {testuser: "testSession"},sessions: { testSession: { votes: { testuser: 2 } } } };

        state = castVote(state, "testuser",5);

        expect(state.sessions.testSession.votes).to.be.deep.equal({testuser: 5});
    });
    it("delete vote in Session", function () {
        let state = {users: {testuser: "testSession"},sessions: { testSession: { votes: { testuser: 2,testVoter: 5 } } } };

        state = castVote(state, "testuser","Nope");

        expect(state.sessions.testSession.votes).to.be.deep.equal({testVoter: 5});
    });
    it("update task in Session", function () {
        let state = {users: {Boss: "testSession"},sessions: { testSession: {owner: "Boss",task: "" } }};

        state = updateTask(state, "Boss","work");

        expect(state.sessions.testSession.task).to.be.equal("work");
    });
    it("do not update task in Session if not owner", function () {
        let state = {users: {NotBoss: "testSession"},sessions: { testSession: {owner: "Boss",task: "" } }};

        state = updateTask(state, "NotBoss","work");

        expect(state.sessions.testSession.task).to.be.equal("");
    });
    it("task update bad input", function () {
        let state = {sessions: { testSession: {owner: "Boss",task: "" } }};

        state = updateTask(state, "NotBoss","work");

        expect(state.sessions.testSession.task).to.be.equal("");
    });

});