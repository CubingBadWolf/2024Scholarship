const express = require('express');
const passport = require('passport');
const OAuth2Strategy = require('passport-oauth2');
const session = require('express-session');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const mainSiteRouter = require('./mainSite');
const config = require('../settings/config.js');

const app = express();
const port = 3000;

// Set up database
const db = new sqlite3.Database('./users.db');

// Create users table if it doesn't exist
db.run(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  oauth_id TEXT UNIQUE,
  role TEXT
)`);

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({ secret: 'your-secret-key', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

app.use('/main', ensureAuthenticated, mainSiteRouter);

// Configure OAuth2 strategy
passport.use(new OAuth2Strategy({
    authorizationURL: 'https://edgeapi.edgelearning.co.nz/oaut2/authorize',
    tokenURL: 'https://provider.com/oauth2/token',
    clientID: 'YOUR_CLIENT_ID',
    clientSecret: 'YOUR_CLIENT_SECRET',
    callbackURL: "http://localhost:3000/auth/callback"
  },
  function(accessToken, refreshToken, profile, cb) {
    // Check if user exists in database, if not, create new user
    db.get("SELECT * FROM users WHERE oauth_id = ?", [profile.id], (err, row) => {
      if (err) return cb(err);
      if (!row) {
        db.run("INSERT INTO users (oauth_id, role) VALUES (?, ?)", [profile.id, 'Student'], (err) => {
          if (err) return cb(err);
          return cb(null, { id: profile.id, role: 'Student' });
        });
      } else {
        return cb(null, { id: row.oauth_id, role: row.role });
      }
    });
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  db.get("SELECT * FROM users WHERE oauth_id = ?", [id], (err, row) => {
    done(err, row);
  });
});

// Routes
app.get('/auth', passport.authenticate('oauth2'));

app.get('/auth/callback', 
    passport.authenticate('oauth2', { failureRedirect: '/login' }),
    (req, res) => {
      res.redirect('/main');  // Redirect to the main page after successful login
    }
  );
  
app.get('/main', ensureAuthenticated, (req, res) => {
    res.sendFile(__dirname + '/public/main.html');
  });

app.get('/dashboard', ensureAuthenticated, (req, res) => {
  res.send(`Welcome, ${req.user.role}!`);
});

app.get('/admin', ensureAdmin, (req, res) => {
  res.send('Admin dashboard');
});

// Middleware to check if user is authenticated
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/auth');
}

// Middleware to check if user is an admin
function ensureAdmin(req, res, next) {
  if (req.isAuthenticated() && req.user.role === 'Administrator') {
    return next();
  }
  res.status(403).send('Access denied');
}

// Route to change user role (admin only)
app.post('/change-role', ensureAdmin, (req, res) => {
  const { userId, newRole } = req.body;
  db.run("UPDATE users SET role = ? WHERE oauth_id = ?", [newRole, userId], (err) => {
    if (err) {
      res.status(500).send('Error updating role');
    } else {
      res.send('Role updated successfully');
    }
  });
});

app.get('/logout', (req, res) => {
    req.logout((err) => {
      if (err) { return next(err); }
      res.redirect('/');
    });
  });

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});