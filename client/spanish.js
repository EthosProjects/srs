//TODO: Make it so that questions about gender are more rare and questions about the correct article are more common at lower levels, and questions about gender may occur multiple times in one lesson.
import spanishJSON from './spanish.json' assert { type: 'json' };
import { getShuffledArray } from './arrayHelpers.js';
export const questionsAndAnswers = new Map([['meaning', [[['What does <WORD> mean?'], ['<MEANING>']]]]]);
export const transformText = (word, text) => {
	const meanings = word.meaning.split('/');
	return meanings.map(meaning => {
		let o_text = text.replace(/<WORD>/g, word.word).replace(/<MEANING>/g, meaning);
		return o_text;
	});
};
export const getTextTransformationHelpers = () => null;
export const fields = ['meaning', 'gender'];
export const getWords = () => {
	const wordsToPractice = spanishJSON;
	const newWords = getShuffledArray([...wordsToPractice].filter(word => word.stage == undefined));
	const stagedWords = [...wordsToPractice]
		.filter(word => word.stage != undefined)
		.sort((a, b) => a.nextReviewDate - b.nextReviewDate);
	const stageMap = new Map();
	stagedWords.forEach(word => {
		if (!stageMap.has(word.nextReviewDate)) stageMap.set(word.nextReviewDate, []);
		stageMap.get(word.nextReviewDate).push(word);
	});
	console.log(newWords, [...stageMap.values()].flat());
	return { newWords, stagedWords: [...stageMap.values()].map(a => getShuffledArray(a)).flat() };
};
export const words = getWords();
const wordMap = new Map();
spanishJSON.forEach((w, i) => {
	wordMap.set(w.ID, i);
});
export const getWordByID = ID => spanishJSON[wordMap.get(ID)];
export const progressMap = new Map();
export const name = 'spanish';
