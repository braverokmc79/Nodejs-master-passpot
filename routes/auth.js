const express = require('express');
const router = express.Router();
const template = require('../lib/template.js');
const auth = require("../lib/auth.js")

const authData = {
  email: "egoing777@gmail.com",
  password: "1111",
  nickanme: 'macaronics'
}

router.get("/login", (req, res) => {
  const title = 'WEB - login';
  const list = template.list(req.list);
  const html = template.HTML(title, list, `
            <form action="/auth/login_process" method="post">
              <p><input type="email" name="email" placeholder="email"></p>  
              <p><input type="password" name="password" placeholder="password"></p>                                 
              <p>
                <input type="submit" value="login">
              </p>
            </form>
          `, '', auth.statusUI(req, res));
  res.send(html);

});


router.post("/login_process", (req, res) => {
  const post = req.body;
  const email = post.email;
  const password = post.password;

  if (email === authData.email && password === authData.password) {
    req.session.is_logined = true;
    req.session.nickname = authData.nickanme;
    req.session.save(function () {
      res.redirect('/');
    });
  } else {
    res.send("Who?");
  }

});



router.get("/logout", (req, res) => {
  req.session.destroy(function (err) {
    res.redirect("/");
  })
});


module.exports = router;
