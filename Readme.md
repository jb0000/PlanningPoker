# Planning Poker
A simple Planning Poker application I wrote within roughly a weekend.
Users can create,  join, and leave sessions. Votes get tracked and visualized immediately. To join a session, the user needs the session code from the session owner. Only the owner can write tasks. If the owner leaves, a random user will be assigned the owner role. If the last user leaves a Session, it is deleted.

## Setup

Only NodeJS (https://nodejs.org/en/download/) and a modern browser are needed.
It was tested and developed on macOS Big Sur and the latest Chrome browser. Run `npm install` in the frontend and backend folder to setup.
Run `npm test` in the backend folder for unit tests.

## Execute

Run `npm start` in both frontend and backend.
The frontend uses port 8080 and, the backend uses port 8081.
Open http://127.0.0.1:8080/ in your browser.

In case of port or address issues, you can change them:

Frontend: 
- frontend/package.json line 3

Backend: 
- backend/application.js line 8
- frontend/public/app.js line 3

## Things to add in the future
- A way to hide votes until everybody has voted
- Security: Sanitize strings from and to users
- Setup: Put the application in docker containers and setup and start with a single command
- Scalable: Use load balancer and multiple session servers
- Responsive design:  Svgs should rescale according to the window and tweak the CSS grid
- Testing: More edge case testing for the unit test and add frontend tests
- Error Handling: Have good looking error messages in the UI if something goes wrong
- Persistence: Use cookies to allow a user to reconnect to the previous state and maybe add a database for the backend
