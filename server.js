const express = require('express')
const app = express()
const server = require('http').Server(app)
const cors = require('cors')
const { ExpressPeerServer } = require("peer");

const io = require('socket.io')(server, {
  allowEIO3: true,
  cors: {
    origin: 'https://peerjs-videocall.vercel.app',
    // origin: 'http://localhost:3001',
    credentials: true
  }
});
const { v4: uuidV4 } = require('uuid')

app.use(cors());

const customGenerationFunction = () =>
  (Math.random().toString(36) + "0000000000000000000").substr(2, 16);

const peerServer = ExpressPeerServer(server, {
  path: "/",
  generateClientId: customGenerationFunction,
});

app.use("/mypeer", peerServer);

var link
app.get('/', (req, res) => {
  link = uuidV4()
  res.redirect(`/${link}`)
})

//API para obtener link de la llamada
app.get('/API', (req, res) => {
  return res.send(link)
})

app.get('/:room', (req, res) => {
  res.render('room', { roomId: req.params.room })
})

io.on('connection', socket => {
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId)
    socket.to(roomId).emit('user-connected', userId)
    // socket.emit('user-connected', userId)

    socket.on('disconnect', () => {
      socket.to(roomId).emit('user-disconnected', userId)
    })
  })
})

server.listen(process.env.PORT || 5000)