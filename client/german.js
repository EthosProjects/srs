//TODO: Make it so that questions about gender are more rare and questions about the correct article are more common at lower levels, and questions about gender may occur multiple times in one lesson.
import germanJSON from './german.json' assert { type: 'json' };
import { getRandomElement, getShuffledArray } from './arrayHelpers.js';
export const questionsAndAnswers = new Map([
	['meaning', [[['What does <WORD> mean?'], ['<MEANING>']]]],
	['partOfSpeech', [[['What part of speech is <WORD>?'], ['<PARTOFSPEECH>']]]],
	[
		'gender',
		[
			[['What gender is <WORD>?', 'Is <WORD> masculine, feminine, or neuter?'], ['<GENDER>']],
			[
				['<MASCULINEARTICLE> <WORD> or <FEMININEARTICLE> <WORD> or <NEUTERARTICLE> <WORD>?'],
				['<CORRECTARTICLE> <WORD>']
			]
		]
	]
]);
const mixMap = new Map([
	['nominative', 0],
	['accusative', 1],
	['dative', 2],
	['mixed', 3]
]);
const declensions = {
	masculine: {
		nominative: ['r', 'e'],
		accusative: ['n', 'n'],
		dative: ['m', 'n'],
		genitive: ['s', 'n'],
		mixed: [false, true, true, true]
	},
	feminine: {
		nominative: ['e', 'e'],
		accusative: ['e', 'e'],
		dative: ['r', 'n'],
		genitive: ['r', 'n']
	},
	neuter: {
		nominative: ['s', 'e'],
		accusative: ['s', 'e'],
		dative: ['m', 'n'],
		genitive: ['s', 'n'],
		mixed: [false, false, true, true]
	},
	plural: {
		nominative: ['e', 'n'],
		accusative: ['e', 'n'],
		dative: ['n', 'n'],
		genitive: ['r', 'n']
	}
};
const getDeclension = (word, nounCase, gender, strength = 'strong') => {
	let o_word = word;
	if (strength == 'strong') {
		if (
			o_word == 'd' &&
			(gender == 'feminine' || gender == 'plural') &&
			(nounCase == 'nominative' || nounCase == 'accusative')
		)
			return 'die';
		if (o_word == 'd' && gender == 'neuter' && (nounCase == 'nominative' || nounCase == 'accusative')) return 'das';
		if ((gender == 'masculine' || gender == 'neuter') && /ein$/.test(o_word)) {
			if (declensions[gender]['mixed'][mixMap.get(nounCase)] == false) return o_word;
		}
	}
	const ending = declensions[gender][nounCase][strength == 'strong' ? 0 : 1];
	if (!/e$/.test(o_word)) o_word += 'e';
	if (ending == 'e') return o_word;
	o_word += ending;
	return o_word;
};
//For debugging
//window.getDeclension = getDeclension;
export const getTextTransformationHelpers = () => {
	return { article: getRandomElement(words.articles) };
};
export const transformText = (word, text, { article }) => {
	const meanings = word.meaning.split('/');
	return meanings.map(meaning => {
		let o_text = text
			.replace(/<WORD>/g, word.word)
			.replace(/<MEANING>/g, meaning)
			.replace(/<PARTOFSPEECH>/g, word.partOfSpeech);
		if (word.gender != undefined)
			o_text = o_text
				.replace(/<GENDER>/g, word.gender)
				.replace(/<CORRECTARTICLE>/g, getDeclension(article.word, 'nominative', word.gender, 'strong'))
				.replace(/<MASCULINEARTICLE>/g, getDeclension(article.word, 'nominative', 'masculine', 'strong'))
				.replace(/<FEMININEARTICLE>/g, getDeclension(article.word, 'nominative', 'feminine', 'strong'))
				.replace(/<NEUTERARTICLE>/g, getDeclension(article.word, 'nominative', 'neuter', 'strong'));
		return o_text;
	});
};
export const fields = ['meaning' /*'gender'*/];
export const getWords = () => {
	const articles = germanJSON.filter(word => word.partOfSpeech == 'article');
	const wordsToPractice = germanJSON.filter(word => word.partOfSpeech != 'article');
	const newWords = getShuffledArray([...wordsToPractice].filter(word => word.stage == undefined));
	const stagedWords = [...wordsToPractice]
		.filter(word => word.stage != undefined)
		.sort((a, b) => a.nextReviewDate - b.nextReviewDate);
	const stageMap = new Map();
	stagedWords.forEach(word => {
		if (!stageMap.has(word.nextReviewDate)) stageMap.set(word.nextReviewDate, []);
		stageMap.get(word.nextReviewDate).push(word);
	});
	console.log(articles, newWords, [...stageMap.values()].flat());
	console.log(stagedWords.filter(word => word.nextReviewDate < Date.now()).length);
	return {
		articles,
		newWords,
		stagedWords: [...stageMap.values()].map(a => getShuffledArray(a)).flat(),
		wrongWords: []
	};
};
export const words = getWords();
const wordMap = new Map();
germanJSON.forEach((w, i) => {
	wordMap.set(w.ID, i);
});
export const getWordByID = ID => germanJSON[wordMap.get(ID)];
export const progressMap = new Map();
export const name = 'german';
