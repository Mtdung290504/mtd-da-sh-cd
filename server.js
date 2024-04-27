const express = require('express');
const fs = require('fs');
const multer = require('multer');
const Database = require('./database');
const axios = require('axios');
const cheerio = require('cheerio');
const ejs = require('ejs');

const app = express();
const upload = multer({ dest: 'uploads/' });
const db = new Database('quiz.db');
const config = {
  selfRequest: false,
  resetDatabase: false
}

app.use(express.static('public'));

app.get('/ping', (req, res) => {
  console.log('Receive self request.');
  res.send('Server is running...');
});

app.post('/upload', upload.single('htmlFile'), (req, res) => {
  console.log('Receive file upload');
  const file = req.file;

  if(!file) {
    res.status(400).send('No file uploaded');
    return;
  }

  fs.readFile(file.path, 'utf8', (err, data) => {
    if (err) {
      res.status(500).send('Error reading file');
      return;
    }

    const questions = extractQuestionsFromDOM(data);

    insertQuestionsToDatabase(questions)
      .then(() => {
        fs.unlink(file.path, err => {
          if(err)
            console.error('Error deleting file:', err);
        });
        res.send('Cảm ơn bạn!');
      })
      .catch((error) => {
        console.error('Error inserting questions:', error);
        res.status(500).send('Error inserting questions');
      });
  });
});

app.get('/', async (req, res)=>{
  try {
    const questions = await db.getAllQuestions();
    res.render(__dirname + '/views/quests.ejs', { questions });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/s', (req, res)=>{
  res.sendFile(__dirname + '/views/upload.html');
});

function extractQuestionsFromDOM(data) {
  const $ = cheerio.load(data);
  let asw_list = [];

  $('.que').each(function() {
    let asw_box = $(this);
    let quest = asw_box.find('.qtext').text();
    let answer = asw_box.find('.rightanswer').text().replace('The correct answer is: ', '');

    if (asw_list.find(asw => asw.quest === quest) !== undefined &&
        asw_list.find(asw => asw.answer === answer) !== undefined) {
      return;
    }

    asw_list.push({
      "quest": quest,
      "answer": answer
    });
  });
  
  return asw_list;
}

function insertQuestionsToDatabase(questions) {
  const insertPromises = questions.map((question) => {
    const { quest, answer } = question;

    return db.checkDuplicateQuestion(quest, answer)
      .then((isDuplicate) => {
        if (!isDuplicate) {
          return db.insertQuestion(quest, answer);
        }
      })
      .catch((error) => {
        console.error('Error inserting question:', error);
      });
  });

  return Promise.all(insertPromises);
}

app.listen(3000, () => {
  const selfRequest = setInterval(()=>{
    axios.get('https://dashcd-vku.glitch.me/ping');
  }, 180 * 1000);
  if(!config.selfRequest)
    clearInterval(selfRequest);
  if(config.resetDatabase)
    db.clearDatabase();
  console.log('Server is running...');
});