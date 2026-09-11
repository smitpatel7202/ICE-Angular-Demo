const { io } = require('socket.io-client');

const url = 'http://localhost:3000';
const clientA = io(url);
const clientB = io(url);

clientA.on('connect', () => {
  console.log('Client A connected', clientA.id);
  const msg = { time: '[now]', sender: 'clientA', text: 'hello from A', isOperator: true };
  console.log('Client A sending message:', msg);
  clientA.emit('chat message', msg);
});

clientB.on('connect', () => {
  console.log('Client B connected', clientB.id);
});

clientB.on('chat message', (msg) => {
  console.log('Client B received message:', msg);
  // close after receiving
  setTimeout(() => {
    clientA.disconnect();
    clientB.disconnect();
    process.exit(0);
  }, 200);
});

// safety timeout
setTimeout(() => {
  console.log('Timeout reached, exiting');
  clientA.disconnect();
  clientB.disconnect();
  process.exit(1);
}, 5000);
