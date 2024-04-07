import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mqtt from 'mqtt';
import userRoutes from './src/routes/userRoutes.js';
import arduinoRoutes from './src/routes/arduinoRoutes.js';

dotenv.config();

const app = express();
const client = mqtt.connect('mqtt://192.168.100.32:1883'); // replace with your MQTT server address and port

let clients = [];

client.on('connect', () => {
  console.log('Connected to MQTT server');
  client.subscribe('arduino/sensor', (err) => {
    if (err) {
      console.error('Failed to subscribe to topic:', err);
    }
  });
});

client.on('message', (topic, message) => {
  console.log(`Received message on ${topic}: ${message.toString()}`);
  clients.forEach((res) => {
    res.write(`data: ${message.toString()}\n\n`);
  });
});

app.use(express.json());
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Algo se rompió!');
});

app.use(cors());  

app.get('/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  clients.push(res);

  req.on('close', () => {
    clients = clients.filter((client) => client !== res);
  });
});

app.use('/', userRoutes, arduinoRoutes);

const URL = process.env.ORIGIN;
const PORT = process.env.PORT;
app.listen(PORT, URL, () => {
  console.log(`El servidor está corriendo en http://${URL}:${PORT}`);
});
