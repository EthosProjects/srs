import fs from 'fs';
import { readFile, writeFile } from 'fs/promises';
import { shuffle } from './arrayHelpers.js';

const germanWords = JSON.parse(fs.readFileSync('german.json', { encoding: 'utf8' }));
const epoch = 1687525200000;

import * as url from 'url';
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

import express from 'express';
import http from 'http';
const getContentType = url => {
	switch (true) {
		case url.endsWith('.json'):
			return 'application/json';
		case url.endsWith('.js'):
			return 'application/javascript';
		case url.endsWith('.html'):
			return 'text/html';
		case url.endsWith('.png'):
			return 'image/png';
		default:
			return 'text/plain';
	}
};
const app = express();
const port = 255;

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/client/index.html');
});
app.get('/german.json', (req, res) => {
	res.sendFile(__dirname + '/german.json');
});
app.get('/spanish.json', (req, res) => {
	res.sendFile(__dirname + '/spanish.json');
});
app.get('/spanish/:wordID/:amountOfWrongAnswers', async (req, res) => {
	const spanishWords = JSON.parse(await readFile('spanish.json', 'utf8'));
	const word = spanishWords.find(e => e.ID == req.params.wordID);
	const amountOfWrongAnswers = Number(req.params.amountOfWrongAnswers);
	console.log(word, amountOfWrongAnswers);

	if (word.stage == undefined) word.stage = +(amountOfWrongAnswers === 0);
	else {
		if (amountOfWrongAnswers === 0) word.stage++;
		else word.stage -= amountOfWrongAnswers * ((word.stage >= 5) + 1);
		word.stage = Math.max(Math.min(word.stage, 9), 0);
	}
	const date = getNextReviewDate(word.stage);
	console.log(word);
	const options = {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		hour: 'numeric',
		minute: 'numeric',
		second: 'numeric'
	};
	console.log(`Next review is at ${date.toLocaleDateString('en-US', options)}`);
	word.nextReviewDate = date.getTime();
	fs.writeFileSync('spanish.json', JSON.stringify(spanishWords, null, 4));
	res.write(JSON.stringify(word, null, 4));
	res.end();
});
const getNextReviewDate = stage => {
	let UTC = Date.now();
	switch (stage) {
		case 0:
			UTC += 1 * 60 * 1000 * 60;
			break;
		case 1:
			UTC += 4 * 60 * 1000 * 60;
			break;
		case 2:
			UTC += 8 * 60 * 1000 * 60;
			break;
		case 3:
			UTC += 24 * 60 * 1000 * 60;
			break;
		case 4:
			UTC += 2 * 24 * 60 * 1000 * 60;
			break;
		case 5:
			UTC += 7 * 24 * 60 * 1000 * 60;
			break;
		case 6:
			UTC += 2 * 7 * 24 * 60 * 1000 * 60;
			break;
		case 7:
			UTC += 30 * 24 * 60 * 1000 * 60;
			break;
		case 8:
			UTC += 2 * 30 * 24 * 60 * 1000 * 60;
			break;
		case 9:
			UTC += 6 * 30 * 24 * 60 * 1000 * 60;
			break;
		default:
			console.error('invalid SRS stage');
	}

	const date = new Date(UTC);
	date.getUTCMinutes() > 10 ? date.setUTCHours(date.getUTCHours() + 1) : null;

	date.setUTCMinutes(0, 0, 0);
	const options = {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		hour: 'numeric',
		minute: 'numeric',
		second: 'numeric'
	};
	return date;
};
app.get('/german/:wordID/:amountOfWrongAnswers', async (req, res) => {
	const germanWords = JSON.parse(await readFile('german.json', 'utf8'));
	const word = germanWords.find(e => e.ID == req.params.wordID);
	const amountOfWrongAnswers = Number(req.params.amountOfWrongAnswers);
	console.log(word);

	if (word.stage == undefined) word.stage = +(amountOfWrongAnswers === 0);
	else {
		console.log(amountOfWrongAnswers, word.stage, req.params.amountOfWrongAnswers);
		if (amountOfWrongAnswers === 0) word.stage++;
		else word.stage -= amountOfWrongAnswers * (word.stage >= 5 + 1);
		word.stage = Math.max(Math.min(word.stage, 9), 0);
	}

	const date = getNextReviewDate(word.stage);
	console.log(word);
	const options = {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		hour: 'numeric',
		minute: 'numeric',
		second: 'numeric'
	};
	console.log(`Next review is at ${date.toLocaleDateString('en-US', options)}`);
	word.nextReviewDate = date.getTime();
	fs.writeFileSync('german.json', JSON.stringify(germanWords, null, 4));
	res.write(JSON.stringify(word, null, 4));
	res.end();
});
app.use('/', function (req, res) {
	let url = req.url == '/' ? 'index.html' : req.url;
	if (!fs.existsSync(`./client/${url}`)) {
		res.status(404).write('Not found!');
		res.end();
		return;
	}
	res.writeHead(200, { 'Content-Type': getContentType(url) });
	res.write(fs.readFileSync(`./client/${url}`));
	res.end();
});

http.createServer(app).listen(port);
const germanArticles = germanWords.filter(word => word.partOfSpeech == 'article');
const wordsToPractice = germanWords.filter(word => word.partOfSpeech != 'article');
const shuffledGermanWords = [...wordsToPractice].filter(word => word.stage == undefined);
let stagedWords = [...wordsToPractice]
	.filter(word => word.stage != undefined)
	.sort((a, b) => a.nextReviewDate - b.nextReviewDate);

console.log(stagedWords[2]);
const wordMap = new Map();
const progressMap = new Map();
const unknown = [];

germanWords.forEach((w, i) => {
	wordMap.set(w.word, i);
});
shuffle(shuffledGermanWords);

console.log(
	`There are ${shuffledGermanWords.length} new words and ${stagedWords.filter(w => w.nextReviewDate <= Date.now()).length} known words and ${stagedWords.filter(w => w.nextReviewDate > Date.now()).length} words waiting`
);
console.log(stagedWords.map(stagedWord => stagedWord.nextReviewDate - Date.now()));
console.log('Completed all german words');
