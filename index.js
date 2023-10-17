const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = 3000;

app.use(bodyParser.json());

// Create a connection to the SQLite database
const db = new sqlite3.Database('./healthtrackpro.db');
db.serialize(() => {
  // Create a table to store patient data
  db.run(`
    CREATE TABLE patientRecords (
      id INTEGER PRIMARY KEY,
      name TEXT,
      age INTEGER,
      diagnosis TEXT,
      treatment TEXT
    )
  `);

});

app.post('/patientRecords', (req, res) => {
  const { name, age, diagnosis, treatment } = req.body;

  // Insert the new patient into the database
  const insertPatient = db.prepare('INSERT INTO patientRecords (name, age, diagnosis, treatment) VALUES (?, ?, ?, ?)');
  insertPatient.run(name, age, diagnosis, treatment);
  insertPatient.finalize();

  res.send('New patient added to the database');
});

app.get('/patientRecords', (req, res) => {
  db.all('SELECT * FROM patientRecords', (err, rows) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      res.json(rows);
    }
  });
});


app.put('/patientRecords/:id', (req, res) => {
  const { id } = req.params;
  const { name, age, diagnosis, treatment } = req.body;

  db.run(
    // update the
    'UPDATE patientRecords SET name = ?, age = ?, diagnosis = ?, treatment = ? WHERE id = ?',
    [name, age, diagnosis, treatment, id],
    (err) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
      } else {
        res.json({ message: 'Patient information updated' });
      }
    }
  );
});

app.delete('/patientRecords/:id', (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM patientRecords WHERE id = ?', id, (err) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      res.json({ message: 'Patient record deleted' });
    }
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
