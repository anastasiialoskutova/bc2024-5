const express = require('express');
const http = require('http');
const { Command } = require('commander');

const app = express();
const program = new Command();

program
  .requiredOption('-h, --host <host>', 'адреса сервера')
  .requiredOption('-p, --port <port>', 'порт сервера')
  .requiredOption('-c, --cache <cache>', 'шлях до директорії для закешованих файлів');

program.parse(process.argv);

const options = program.opts();

if (!options.host || !options.port || !options.cache) {
  console.error('Помилка: усі параметри --host, --port та --cache повинні бути вказані!');
  process.exit(1);
}

//GET /notes/<ім’я нотатки>
app.get('/notes/:noteName', (req, res) => {
  const notePath = path.join(options.cache, req.params.noteName);

  if (!fs.existsSync(notePath)) {
      return res.status(404).send('Not found');
  }

  const noteText = fs.readFileSync(notePath, 'utf8');
  res.send(noteText);
});

//PUT /notes/<ім’я нотатки>
app.put('/notes/:noteName', (req, res) => {
  const notePath = path.join(options.cache, req.params.noteName);
  if (!fs.existsSync(notePath)) {
      return res.status(404).send('Not found');
  }
  const newText = req.body.text;
  if (newText === undefined) {
      return res.status(400).send('Enter text');
  }
  fs.writeFileSync(notePath, newText);
  res.send('Note updated');
});

//DELETE /notes/<ім’я нотатки>
app.delete('/notes/:noteName', (req, res) => {
  const notePath = path.join(options.cache, req.params.noteName);
  if (!fs.existsSync(notePath)) {
      return res.status(404).send('Not found');
  }
  fs.unlinkSync(notePath);
  res.send('Note deleted');
});


console.log(`Host: ${options.host}\nPort: ${options.port}\nCache Directory: ${options.cache}`);

// Створення HTTP сервера, передаючи в нього Express додаток
const server = http.createServer(app);

server.listen(options.port, options.host, () => {
  console.log(`Сервер запущено на http://${options.host}:${options.port}`);
});
