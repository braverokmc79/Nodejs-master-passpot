const express = require('express');
const router = express.Router();
const template = require('../lib/template.js');
const auth = require("../lib/auth.js");
const crypto = require('crypto');
const db = require("../lib/db");

const authData = {
  email: "egoing777@gmail.com",
  password: "1111",
  nickanme: 'macaronics'
}


const passport = require('passport');
const LocalStrategy = require('passport-local');


const customFields = {
  usernameField: 'username',
  passwordField: 'password'
};

passport.use(new LocalStrategy(customFields, function verify(username, password, cb) {

  db.query('SELECT * FROM users WHERE username = ?', [username], function (err, row) {
    if (err) { return cb(err); }
    if (!row) { return cb(null, false, { message: 'Incorrect username or password.' }); }

    crypto.pbkdf2(password, row[0].salt, 310000, 32, 'sha256', function (err, hashedPassword) {
      console.log("로그인 데이터 : ", password, row[0].salt, hashedPassword.toString('hex'));
      console.log("로그인 DB암호: ", row[0].hashed_password);

      if (err) { return cb(err); }
      if (row[0].hashed_password !== hashedPassword.toString('hex')) {
        console.log("비밀번호 오류");
        return cb(null, false, { message: 'Incorrect username or password.' });
      }

      console.log("로그인 성공");
      res.redirect('/');
      //return cb(null, row);
    });
  });

}));

router.post('/login_process', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/auth/login'
}));


router.get('/signup', function (req, res, next) {
  const title = 'WEB - login';
  const list = template.list(req.list);
  const html = template.HTML(title, list, `
           <h1>Sign up</h1>
      <form action="/auth/signup" method="post">
          <section>
              <label for="username">username</label>
              <input id="username" name="username" type="text" autocomplete="username" required>
          </section>
         <section>
              <label for="email">email</label>
              <input id="email" name="email" type="email" autocomplete="email" required>
          </section>          
          <section>
              <label for="password">Password</label>
              <input id="password" name="password" type="password" autocomplete="new-password" required>
          </section>
          <button type="submit">Sign up</button>
      </form>
          `, '', auth.statusUI(req, res));
  res.send(html);
});



router.post('/signup', async function (req, res, next) {

  crypto.randomBytes(16, (error, buf) => {
    const salt = buf.toString("base64");

    crypto.pbkdf2(req.body.password.trim(), salt, 310000, 32, 'sha256', function (err, hashedPassword) {
      console.log("회원가입 데이터 : ", req.body.password, salt, hashedPassword.toString('hex'));

      if (err) { return next(err); }
      db.query('INSERT INTO users (username,email, hashed_password, salt) VALUES (?, ?, ?, ?)', [
        req.body.username,
        req.body.email,
        hashedPassword.toString('hex'),
        salt
      ], function (err) {
        console.log("에러 :", err);
        if (err) {
          return res.status(500).json({ err: err.toString() })
        }
        //if (err) { return next(err); }
        var user = {
          id: this.lastID,
          username: req.body.username
        };
        // req.login(user, function (err) {
        //   if (err) { return next(err); }
        //   res.redirect('/');
        // });
        res.redirect('/');
      });
    });


  });
});


router.get("/login", (req, res) => {
  const title = 'WEB - login';
  const list = template.list(req.list);
  const html = template.HTML(title, list, `
            <form action="/auth/login_process" method="post">
              <p><input type="text" name="username" placeholder="username"></p>  
              <p><input type="password" name="password" placeholder="password"></p>                                 
              <p>
                <input type="submit" value="login">
              </p>
            </form>
          `, '', auth.statusUI(req, res));
  res.send(html);

});



router.get("/logout", (req, res) => {
  req.session.destroy(function (err) {
    res.redirect("/");
  })
});



// router.post("/login_process", (req, res) => {
//   const post = req.body;
//   const email = post.email;
//   const password = post.password;

//   if (email === authData.email && password === authData.password) {
//     req.session.is_logined = true;
//     req.session.nickname = authData.nickanme;
//     req.session.save(function () {
//       res.redirect('/');
//     });
//   } else {
//     res.send("Who?");
//   }

// });




module.exports = router;
