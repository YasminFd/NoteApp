const express = require('express');
const app = express();
const router = express.Router();
const port = 3000;
app.use(express.urlencoded({ extended: true }));

//Configure express sessions 
const session = require('express-session');
const cookieParser = require("cookie-parser");
const oneDay = 1000 * 60 * 60 * 24;
app.use(
  session({
    secret: 'ThisIsMySecretKey1111',
    resave: false,
    saveUninitialized: false,
    saveUninitialized:true,
    cookie: { maxAge: oneDay },
    resave: false 
  })
);

// Set the view engine and static directory
app.set('view engine', 'ejs');
app.use(cookieParser());
app.use(express.static('public'));
app.use(express.static('/css/styles.css'));
const db = require("./public/js/scripts");
const auth = require("./public/js/auth");
app.use(auth);
db.connect();
db.createDB();
db.createTables();
// Endpoints for HTML:
// Root route
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

app.get('/', (req, res) => {
  res.render('signup', {
    title: 'Sign Up',session: session.userid
  });
});
app.get('/',(req,res) => {
  let session=req.session;
  if(session.userid){
    res.render('home', {
      session: session.userid
  });
  }else
  res.redirect(`/signup`)
});

// Login route
app.get('/home', async (req, res) => {
  const id = req.session.userid;
  try {
    const notes = await db.getALlNotes(id);
    res.render('index', {
      title: 'Home',
      notes: notes,
      id: id,
      session: req.session.userid
    });
  } catch (err) {
    // Handle the error, e.g., send an error response
    res.status(500).send('Error reading notes');
  }
});

// Signup route
app.get('/login', (req, res) => {
  res.render('login', {
    title: 'Log In',
    session: req.session.userid
  });
});

// About route
app.get('/about', (req, res) => {
  res.render('about', {
    title: 'About Us',
    session: req.session.userid
  });
});



//Log Out
app.get('/logout',(req,res) => {
  req.session.destroy();
  res.redirect('/');
});
//Requests
app.post('/login', (req, res) => {
  const name = req.body.name; // Access POST parameters from req.body
  const password = req.body.password;
  db.loginUser(name,password,req,res)
})
app.post('/signup', (req, res) => {
  const name = req.body.name; // Access POST parameters from req.body
  const password = req.body.password;
  const password2 = req.body.password2;
  db.signupUser(name,password,password2,req,res)
})
app.post('/add_note',(req,res)=>{
  const title = req.body.title
  const description = req.body.description
  const id = req.body.id
  db.addNoteToUser(title,description,id, res)
})
app.get('/delete_note/:id/:user',(req,res)=>{
  const id = req.params.id.toString();
  const user = req.params.user
  db.deleteNote(id,user,res)
})
app.get('/show_note/:id', async (req, res) => {
  const id = req.params.id.toString();

  try {
    const note = await db.getNoteByID(id);
    res.render('note', {
      title: '',
      note: note[0], // Note is an array, so select the first item
    
    });
  } catch (err) {
    // Handle the error, e.g., send an error response
    res.status(500).send('Error reading note');
  }
});
app.get('/edit/:id/:user', async (req, res) => {
  const id = req.params.id.toString();
  const user = req.params.user;
  try {
    const note = await db.getNoteByID(id);
    if (note && note.length > 0) {
      res.render('edit', {
        title: '',
        note: note[0],
        user: user ,
        session: req.session.userid// Note is an array, so select the first item
      });
    } else {
      res.status(404).send('Note not found');
    }
  } catch (err) {
    console.error('Error reading note:', err);
    res.status(500).send('Error reading note');
  }
});
app.post('/update_note',(req,res)=>{
  const title = req.body.title
  const description = req.body.description
  const id = req.body.id
  db.updateNoteByID(id,title,description,res)
})

