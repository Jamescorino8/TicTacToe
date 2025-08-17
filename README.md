## Project Overview

This project is a simple implementation of a Tic Tac Toe game using Node.js, Express, and Socket.io for real-time communication between players.

### Features

- Basic game logic for Tic Tac Toe

### Technologies Used

- Node.js
- Express
- Socket.io
- HTML/CSS
- JavaScript

### Getting Started

1. Clone the repository
2. Navigate to the project directory
3. Install dependencies using `npm install`
4. Start the server using `npm start`
5. Open your browser and go to `http://localhost:3000`

### Folder Structure

```
Tic-Tac-Toe/
├── public/
│   ├── index.html
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── main.js       
├── server/
│   ├── server.js
│   ├── package.json
│   └── package-lock.json
├── README.md
└── .gitignore
```

### How to Play

1. Open the game in two separate browser windows or tabs.
2. One player will create a room and share the room ID with the other player.
3. Players take turns making moves by clicking on the grid.
4. The game will announce the winner or a draw when the game ends.

### Future Improvements

- Room ID validation
- UI/UX improvements