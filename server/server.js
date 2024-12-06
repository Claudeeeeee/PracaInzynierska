const express = require('express');
const cors = require('cors');
const db = require('./database');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/spin', (req, res) => {
    const { spins, balance, averageSpinPrice } = req.body;
    const stmt = db.prepare("INSERT INTO spins (spins, balance, averageSpinPrice) VALUES (?, ?, ?)");
    stmt.run(spins, balance, averageSpinPrice, function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ id: this.lastID, spins, balance, averageSpinPrice });
    });
    stmt.finalize();
});

app.listen(8080, () => {
    console.log('Server is running on port 8080');
});
