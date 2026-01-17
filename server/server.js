import express from 'express';
import cors from 'cors';
import pg from 'pg';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const JWT_SECRET = process.env.JWT_SECRET || 'secret_key_super_sicura';

// Middleware
app.use(cors());
app.use(express.json());

// Database Configuration
const { Pool } = pg;
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'albasax_db',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

// Test DB Connection
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Errore di connessione al database:', err.stack);
  }
  client.query('SELECT NOW()', (err, result) => {
    release();
    if (err) {
      return console.error('Errore eseguendo la query:', err.stack);
    }
    console.log('Database connesso con successo:', result.rows[0]);
  });
});

// Routes

// REGISTER
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check user exists
    const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userCheck.rows.length > 0) {
      return res.status(401).json({ error: 'Email già registrata' });
    }

    // Hash password
    const saltRound = 10;
    const bcryptPassword = await bcrypt.hash(password, saltRound);

    // Insert user
    const newUser = await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *',
      [name, email, bcryptPassword]
    );

    // Generate Token
    const token = jwt.sign({ user_id: newUser.rows[0].id }, JWT_SECRET, { expiresIn: '1h' });

    res.json({ token, user: { name: newUser.rows[0].name, email: newUser.rows[0].email } });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// LOGIN
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check user exists
    const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (user.rows.length === 0) {
      return res.status(401).json({ error: 'Password o Email non corretta' });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.rows[0].password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Password o Email non corretta' });
    }

    // Generate Token
    const token = jwt.sign({ user_id: user.rows[0].id }, JWT_SECRET, { expiresIn: '1h' });

    res.json({ token, user: { name: user.rows[0].name, email: user.rows[0].email } });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Middleware di autenticazione
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// UPDATE PROFILE
app.put('/api/update-profile', authenticateToken, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const userId = req.user.user_id; // From token

    let updateQuery = 'UPDATE users SET name = $1, email = $2';
    let queryParams = [name, email];
    let paramIndex = 3;

    if (password && password.length > 0) {
      const saltRound = 10;
      const bcryptPassword = await bcrypt.hash(password, saltRound);
      updateQuery += `, password = $${paramIndex}`;
      queryParams.push(bcryptPassword);
      paramIndex++;
    }

    updateQuery += ` WHERE id = $${paramIndex} RETURNING name, email`;
    queryParams.push(userId);

    const updatedUser = await pool.query(updateQuery, queryParams);

    if (updatedUser.rows.length === 0) {
      return res.status(404).json({ error: 'Utente non trovato' });
    }

    res.json({ user: updatedUser.rows[0], message: 'Profilo aggiornato con successo' });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Errore del server durante l\'aggiornamento' });
  }
});

app.listen(PORT, () => {
  console.log(`Server avviato sulla porta ${PORT}`);
});
