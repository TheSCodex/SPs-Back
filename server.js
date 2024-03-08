import express from 'express'
import dotenv from 'dotenv';
import cors from 'cors';
dotenv.config();

const app = express();

app.use(express.json());
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).send('Algo se rompió!')
  })

  app.use(cors({
    origin: 'http://localhost:5173',
    methods: 'GET, POST, PUT, DELETE, PATCH',
    allowedHeaders: 'Content-Type',
  }));

// Las rutas del API
// app.use('/SPs',);
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`El servidor esta corriendo en el puerto ${PORT}`);
});
