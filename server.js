import express from 'express';
import cors from 'cors';
import routes from './routes/routesIndex.js'
import 'dotenv/config'
import 'https'

const app = express();

// Conectar a MongoDB
import "./db/dbconnection.js";

// Logger
import morgan from 'morgan'

// Logger configuration
app.use(morgan(function (tokens, req, res) {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    'Res-Stat:',
    tokens.status(req, res),
    'Content-Length :',
    tokens.res(req, res, 'content-length'),
    'Response-Time:',
    tokens['response-time'](req, res), 'ms',
    'Date:',
    tokens.date(req, res),
  ].join(' - ')
}))

// Middlewares

const allowedOrigins = [
  //  production frontend URL
  'https://sis-eval.vercel.app',
  'https://sis-eval-morefews-projects.vercel.app',
  'http://localhost:5173',
  'http://localhost:5000',
  'http://localhost:5001',
];

app.use(cors(
  {
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g., server-to-server or Postman)
      if (!origin) return callback(null, true);

      // Normalize origin by removing trailing slash
      const normalizedOrigin = origin.replace(/\/$/, '');

      // Allow stable origins
      if (allowedOrigins.includes(normalizedOrigin)) {
        return callback(null, true);
      }

      // Allow Vercel preview URLs
      if (normalizedOrigin.match(
        /^https:\/\/sis-eval-[a-z0-9]+-morefews-projects\.vercel\.app$/)
      ) {
        return callback(null, true);
      }

      // Reject any other origin
      callback(new Error(`Not allowed by CORS: ${normalizedOrigin}`));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false, // Set to true if cookies or auth headers are needed
  }
));
// JSON Request body parser
app.use(express.json());
// Front-End
app.use(express.static('dist'))


// Routes index
app.use(routes)

// Server running port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port: ${PORT}`));