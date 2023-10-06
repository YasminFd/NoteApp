
const mysql = require('mysql');
var session

const dbConnection = mysql.createConnection({
    host: 'localhost', // Your MySQL host
    user: 'root', // Your MySQL username
    password: '', // Your MySQL password
    database: 'notes' // Your MySQL database name
});

exports.connect = function () {
    // Connect to the MySQL server
    dbConnection.connect((err) => {
        if (err) {
            console.error('Error connecting to MySQL:', err);
            return;
        }
        console.log('Connected to MySQL');
    });
}
exports.createDB = function () {
    dbConnection.query("CREATE DATABASE IF NOT EXISTS notes", function (err, result) {
        if (err) throw err;
        console.log("Database created");
    });
}
exports.createTables = function () {
    dbConnection.query(
        "CREATE TABLE IF NOT EXISTS users (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), password VARCHAR(255))",
        function (err, result) {
            if (err) throw err;
            console.log("users table created");
        }
    );
    dbConnection.query(
        "CREATE TABLE IF NOT EXISTS notes (id INT AUTO_INCREMENT PRIMARY KEY, title VARCHAR(255), description TEXT, user_id INT, FOREIGN KEY (user_id) REFERENCES users(id))",
        function (err, result) {
            if (err) throw err;
            console.log("notes table created");
        }
    );
}
exports.loginUser = function (name, password,req, res) {
    const sql = 'SELECT * FROM users WHERE name = ? and password = ?';
    dbConnection.query(sql, [name, password], (err, results) => {
        if (err) {
            console.error('Error reading user:', err);
            res.status(500).json({
                error: 'Failed to fetch user'
            });
        } else if (results.length === 0) {
            res.status(404).json({
                error: 'User not found'
            });
        } else {
            const user = results[0];
            session=req.session;
            session.userid=results[0].id;
            // Passwords match, return user information
            const id = user.id;
            res.redirect(`/home`);
               
            
        }
    });
}

exports.signupUser = function (name, password, password2, req, res) {
    const sql = 'INSERT INTO users (name, password) VALUES (?, ?)';
    dbConnection.query(sql, [name, password], (err, result) => {
        if (err || password != password2) {
            console.error('Error creating user:', err);
            res.status(500).json({
                error: 'Failed to create user'
            });
        } else {
            const id = result.insertId; // Ensure the correct property name
            session=req.session;
            session.userid=id;
            console.log("new user created with ID:", id);
            res.redirect(`/home`);
        }
    });
}

exports.getALlNotes = function (id) {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM notes WHERE user_id = ?';
        dbConnection.query(sql, [id], (err, results) => {
            if (err) {
                console.error('Error reading notes:', err);
                reject(err); // Reject the promise with the error
            } else {
                resolve(results); // Resolve the promise with the results
            }
        });
    });
}
exports.addNoteToUser = function (title, description, id , res) {
    const sql = 'INSERT INTO notes (title, description, user_id) VALUES (?, ?, ?)';
    dbConnection.query(sql, [title, description, id], (err, result) => {
        if (err) {
            console.error('Error creating note:', err);
        } else {
            console.log("note created succesfully")
            res.redirect(`/home/${id}`);
        }
    });
}

exports.deleteNote = function(id,user,res){
    const sql = 'DELETE FROM notes WHERE id = ?';
  dbConnection.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Error deleting note:', err);
    } else if (result.affectedRows === 0) {
      console.log('Note not found' );
    } else {
        console.log("Note deleted succesfully");
    }
    res.redirect(`/home/${user}`);
  });
}

exports.getNoteByID = function(id){
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM notes WHERE id = ?';
        dbConnection.query(sql, [id], (err, results) => {
            if (err) {
                console.error('Error reading notes:', err);
                reject(err); // Reject the promise with the error
            } else {
                resolve(results); // Resolve the promise with the results
            }
        });
    });
}

exports.updateNoteByID = function(id,title,description,res)
    {
    const sql = 'UPDATE notes SET title = ?, description = ? WHERE id = ?';
    dbConnection.query(sql, [title, description, id], (err, result) => {
      if (err) {
        console.error('Error updating note:', err);
        res.status(500).json({ error: 'Failed to update note' });
      } else if (result.affectedRows === 0) {
        res.status(404).json({ error: 'Note not found' });
      } else {
        res.redirect(`/show_note/${id}`)
      }
    });
  }