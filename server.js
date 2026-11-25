import 'dotenv/config';
import express from 'express';
import expressLayouts from 'express-ejs-layouts';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import indexRoutes from './src/routes/index.js';
import pool from './src/database/db.js';
import { requestLogger } from './src/middleware/requestLogger.js';
import { notFound, errorHandler } from './src/middleware/errorHandler.js';
import authRoutes from './src/routes/authRoutes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));
app.use(expressLayouts);
app.set('layout', 'layouts/main');

app.use(express.static(path.join(__dirname, 'public')));

if (process.env.NODE_ENV !== 'production') {
  app.use(requestLogger);
}

app.use(express.urlencoded({ extended: true }));

app.use('/', indexRoutes);
app.use('/', authRoutes);


// error handling
app.use(notFound);
app.use(errorHandler);

await pool.query('SELECT 1');
app.listen(PORT, () => console.log(`Homebrew Haven running on http://localhost:${PORT}`));