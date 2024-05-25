import { getRandomElement, getRandomIndex, ensureArray, getWeightedRandomItem } from './arrayHelpers.js';

import similarity from './similarity.js';
//Currently, the way that this works is that it is primed for language. So lets decouple this file from language so that I can do any language. Towards this end, I will need to identify the control flow relataed to language so that I can implement it for language

//So, none of the functions actcually do anything except for the practice function and getWords function/the functions responsible for prepping the shit.

//So the flow is that we get the words, then we run the practice function but IDK what that does yet

//This is the prep, right here
const maxLowStageWords = 10;
const lowStageWordsSize = ({ words: { stagedWords }, progressMap, getWordByID }) => {
	return stagedWords
		.concat([...progressMap.keys()].map(getWordByID).filter(word => word.stage !== undefined))
		.filter(word => word.stage <= 3).length;
};
const hasWord = ({ words: { newWords, stagedWords, wrongWords }, progressMap, getWordByID }) =>
	stagedWords[0]?.nextReviewDate <= Date.now() ||
	progressMap.size > 0 ||
	(newWords.length > 0 && lowStageWordsSize({ words: { stagedWords }, progressMap, getWordByID }) < maxLowStageWords);
const chooseWord = ({ words: { newWords, stagedWords }, progressMap, getWordByID }) => {
	if (!hasWord({ words: { newWords, stagedWords }, progressMap, getWordByID }))
		throw new Error('No word to choose from');
	//Don't add new words if we have 100 or more words that are less than stage 3
	const probabilities = {
		newWord: 2,
		progressedWord: 4,
		stagedWords: 3,
		wrongWord: 2
	};
	console.log(lowStageWordsSize({ words: { stagedWords }, progressMap, getWordByID }));
	const wordListData = [
		[
			'newWord',
			{
				flag:
					newWords.length > 0 &&
					lowStageWordsSize({ words: { stagedWords }, progressMap, getWordByID }) < maxLowStageWords,
				weight: 1
			}
		],
		[
			'progressedWord',
			{
				flag:
					[...progressMap.values()].filter(p => [...p.values()].some(d => d.amountOfWrongAnswers === 0))
						.length > 0,
				weight: 7
			}
		],
		['stagedWord', { flag: stagedWords.length > 0 && stagedWords[0].nextReviewDate <= Date.now(), weight: 4 }],
		[
			'wrongWord',
			{
				flag:
					[...progressMap.values()].filter(p => [...p.values()].some(d => d.amountOfWrongAnswers > 0))
						.length > 0,
				weight: 2
			}
		]
	];
	const wordWeights = wordListData.map(([name, { flag, weight }]) => [name, flag * weight]);
	if (!wordWeights.some(([_, weight]) => weight)) return null;
	const wordList = getWeightedRandomItem(wordWeights.map(([name, weight]) => ({ name, weight })));
	console.log(wordList.name);
	switch (wordList.name) {
		case 'newWord':
			return newWords.shift();
		case 'progressedWord':
			return getWordByID(
				getRandomElement(
					[...progressMap]
						.filter(([_, value]) => [...value.values()].some(d => d.amountOfWrongAnswers === 0))
						.map(([key, _]) => key)
				)
			);
		case 'stagedWord':
			return stagedWords.shift();
		case 'wrongWord':
			return getWordByID(
				getRandomElement(
					[...progressMap]
						.filter(([_, value]) => [...value.values()].some(d => d.amountOfWrongAnswers > 0))
						.map(([key, _]) => key)
				)
			);
		default:
			throw new Error('Got to end of logic without choosing word');
	}
};
class ProgressData {}
class FieldProgressData {
	constructor() {
		this.didAnswer = false;
		this.amountOfWrongAnswers = 0;
		this.didAnswerCorrectly = false;
	}
}
const hasOption = (progress, { fields }) => fields.some(field => progress.get(field)?.didAnswerCorrectly === false);
const chooseQuestionAndAnswers = (
	word,
	{ getTextTransformationHelpers, fields, progressMap, questionsAndAnswers, transformText }
) => {
	if (!progressMap.has(word.ID)) {
		const progress = new Map([
			//This is what it looks like
			//['meaning', 0]
			//["gender", 0]
		]);
		fields.forEach(field => (word[field] !== undefined ? progress.set(field, new FieldProgressData()) : null));
		progressMap.set(word.ID, progress);
	}
	const progress = progressMap.get(word.ID);
	console.log(fields, progress);
	const option = getRandomElement(fields.filter(field => progress.get(field)?.didAnswerCorrectly === false));
	//
	const rawQuestionsAnswers = questionsAndAnswers.get(option);
	const questionIndex = getRandomIndex(rawQuestionsAnswers);
	const helpers = getTextTransformationHelpers();
	let correctAnswers = ensureArray(rawQuestionsAnswers[questionIndex][1])
		.map(a => transformText(word, a, helpers))
		.flat();
	let question = transformText(word, getRandomElement(rawQuestionsAnswers[questionIndex][0]), helpers)[0];
	let answers = [...questionsAndAnswers.values()]
		.map(QnAs => QnAs.map(QnA => QnA[1]))
		.flat(Infinity)
		.map(a => transformText(word, a, helpers))
		.flat();
	return { question, correctAnswers: [...new Set(correctAnswers)], answers: [...new Set(answers)], progress, option };
};
//chooseWord()
//chooseQuestionsAndAnswers()
//updateDOM()
//set submit listener.
//
//// In the submit listener, we update the dom
// then we check to see if the answer is correct
// if the answer is correct, then we check to set it as wrong
//
import * as spanish from './spanish.js';
import * as german from './german.js';
const practice = language =>
	new Promise(resolve => {
		if (!hasWord(language)) return resolve();
		//TODO:consider refactoring this so that we have a hasWord() and then if hasWord returns null, exit the loop.
		let word, question, answers, correctAnswers, progress, option;

		const getNewQuestionAndAnswers = () => {
			console.log(
				maxLowStageWords - lowStageWordsSize(language),
				language.progressMap.size,
				language.words.stagedWords.filter(w => w.nextReviewDate <= Date.now()).length
			);
			word = chooseWord(language);
			console.log(
				maxLowStageWords - lowStageWordsSize(language),
				language.progressMap.size,
				language.words.stagedWords.filter(w => w.nextReviewDate <= Date.now()).length
			);
			({ question, answers, correctAnswers, progress, option } = chooseQuestionAndAnswers(word, language));
			const questionHeader = document.getElementById('question-text');
			questionHeader.textContent = question;
			document.getElementById('input-label').textContent = option;
			document.getElementById('question-remaining').textContent =
				language.words.stagedWords.filter(w => w.nextReviewDate <= Date.now()).length +
				language.progressMap.size +
				//add the amount of new words that can still be added but subtract the amount which are currently in the que to avoid double counting
				Math.min(language.words.newWords.length, Math.max(0, maxLowStageWords - lowStageWordsSize(language))) -
				[...language.progressMap.keys()].filter(key => language.getWordByID(key).stage == undefined).length;
			console.log(
				maxLowStageWords - lowStageWordsSize(language),
				language.progressMap.size,
				language.words.stagedWords.filter(w => w.nextReviewDate <= Date.now()).length
			);
		};
		console.log(
			maxLowStageWords - lowStageWordsSize(language),
			language.progressMap.size,
			language.words.stagedWords.filter(w => w.nextReviewDate <= Date.now()).length
		);
		getNewQuestionAndAnswers();

		document.getElementById('input-form').addEventListener('submit', async function processAnswer(e) {
			e.preventDefault();
			//Get value then empty the input;
			const answer = document.getElementById('answer-input').value;
			document.getElementById('answer-input').value = '';
			const feedback = document.getElementById('feedback');
			const didAnswer = !answers.some(a => similarity(answer, a) > (a.length - 1) / a.length) && answer !== '';
			const isCorrect = correctAnswers.some(a => similarity(a, answer) > (a.length - 1) / a.length);
			if (!didAnswer && !isCorrect)
				return (feedback.textContent = `We are looking for the answer to '${question}'`);
			if (!isCorrect) feedback.textContent = `Wrong. The ${option} of ${word.word} is ${correctAnswers[0]}`;
			else feedback.textContent = 'Correct!';

			const progressOption = progress.get(option);
			progressOption.amountOfWrongAnswers += 1 * !isCorrect;
			progressOption.didAnswerCorrectly = isCorrect;

			if (!hasOption(progress, language)) {
				word = JSON.parse(
					await (
						await fetch(
							`/${language.name}/${word.ID}/${[...progress.values()].reduce((a, c) => Math.max(a, c.amountOfWrongAnswers), 0)}`
						)
					).text()
				);
				if (isCorrect) {
					language.progressMap.delete(word.ID);
					language.words.stagedWords.push(word);
				}
			}
			if (hasWord(language)) getNewQuestionAndAnswers();
			else resolve();
			return false;
		});
		//await practice();
	});
await practice(spanish);
await practice(german);
