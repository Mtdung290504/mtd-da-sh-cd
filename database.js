const sqlite3 = require('sqlite3').verbose();

class Database {
  constructor(dbPath) {
    this.db = new sqlite3.Database(dbPath);
    this.initSchema();
  }

  initSchema() {
    this.db.run(`CREATE TABLE IF NOT EXISTS questions (
      question TEXT,
      answer TEXT
    )`);
  }

  insertQuestion(questionText, answerText) {
    return new Promise((resolve, reject) => {
      this.db.run(
        'INSERT INTO questions (question, answer) VALUES (?, ?)',
        [questionText, answerText],
        function (err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.lastID);
          }
        }
      );
    });
  }

  checkDuplicateQuestion(questionText, answerText) {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT COUNT(*) AS count FROM questions WHERE question = ? AND answer = ?',
        [questionText, answerText],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row.count > 0);
          }
        }
      );
    });
  }
  
  getAllQuestions() {
    return new Promise((resolve, reject) => {
      this.db.all('SELECT * FROM questions', (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows || []);
        }
      });
    });
  }
  
  clearDatabase() {
    this.db.run('DELETE FROM questions', function (err) {
      if (err) {
        console.error(err);
      } else {
        console.log('Bảng "questions" đã được làm trống.');
      }
    });
  }
}

module.exports = Database;