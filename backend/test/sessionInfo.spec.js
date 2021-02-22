import { expect } from 'chai';
import { getUsers, getVotes } from '../lib/sessionInfo.js';

describe("sessionInfo", () =>{
    it("getUsers returns users", () => {
        const state = { users: {user1: "1",user3: "2",user4: "1",user2: "1",}}
        const result = getUsers(state, "1");
        expect(result).to.deep.equal(["user1","user4","user2"]);
    })
   it("getVotes return number of Votes", () => {
        const state = {sessions:{testSession:{votes:{a:1,b:1,c:2,f:15}}}};
        const result = getVotes(state, "testSession");
        expect(result).to.deep.equal({"1":2,"2": 1, "15": 1})
    })
    it("getVotes for false input", () => {
        const state = {sessions:{testSession:{votes:{a:1,b:1,c:2,f:15}}}};
        const result = getVotes(state, "hahaha");
        expect(result).to.deep.equal({})
    })
})