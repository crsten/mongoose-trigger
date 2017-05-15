const PORT = 3000;

const app = require('express')();
const server = require('http').Server(app);

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://127.0.0.1/mongoose-trigger-test', err => {
  if(err) throw new Error(err);
  console.log('Connected to DB');
});

const Schemas = require('./models/user');

server.listen(PORT);

app.use(require('body-parser').json());

app.get('/', function(req, res, next) {
  res.sendFile(__dirname + '/layout/index.html');
});

app.post('/', function(req, res, next) {
  let skills = [];
  req.body.skills.forEach(skill => {
    let x = Schemas.Skill.create({
      name: skill,
      usefull: Math.random() >= 0.5
    },(err) => {
      if(err) return res.status(400).send(err);
    });

    skills.push(x);
  })

  Promise.all(skills)
    .then(values => {
      Schemas.User.create({
        name: req.body.name,
        email: req.body.email,
        skills: values
      }, (err, user) => {
        if(err) return res.status(400).send(err);
        res.sendStatus(200);
      });
    })

});

app.delete('/', function(req, res, next) {
  Schemas.User.findOne()
    .exec((err, user) => {
      if(err) return res.status(400).send(err);
      if(!user) return res.sendStatus(404);

      user.remove(err => {
        if(err) return res.status(400).send(err);
        res.sendStatus(200);
      });
    })
})

app.put('/', function(req, res, next) {
  Schemas.User.findOne()
    .exec((err, user) => {
      if(err) return res.status(400).send(err);
      if(!user) return res.sendStatus(404);

      user.name = req.body.name;
      user.save(err => {
        if(err) return res.status(400).send(err);
        res.sendStatus(200);
      });

    });
});
