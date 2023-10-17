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
      National_Id INTEGER,
      Heart_rate INTEGER,
      temperature INTEGER,
      frequent_sickness TEXT
    )
  `);

});

app.post('/patientRecords', (req, res) => {
  const { name, National_Id, Heart_rate, temperature,frequent_sickness } = req.body;

  // Insert the new patient into the database
  const insertPatient = db.prepare('INSERT INTO patientRecords (name, National_Id, Heart_rate, temperature,frequent_sickness) VALUES (?, ?, ?, ?,?)');
  insertPatient.run(name, National_Id, Heart_rate, temperature,frequent_sickness);
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
  const { name, National_Id, Heart_rate, temperature,frequent_sickness} = req.body;

  db.run(
    // update the
    'UPDATE patientRecords SET name = ?, National_Id = ?, temperature = ?,Heart_rate = ?, frequent_sickness = ? WHERE id = ?',
    [name, National_Id, Heart_rate, temperature,frequent_sickness, id],
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
