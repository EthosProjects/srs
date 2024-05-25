export function shuffle(array) {
	let currentIndex = array.length;

	// While there remain elements to shuffle...
	while (currentIndex != 0) {
		// Pick a remaining element...
		let randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex--;

		// And swap it with the current element.
		[array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
	}
	return array;
}
export const ensureArray = item => (item.constructor == Array ? item : [item]);
export const getRandomElement = array => array[Math.floor(Math.random() * array.length)];
export const getRandomIndex = array => Math.floor(Math.random() * array.length);
export const getShuffledArray = array => shuffle(JSON.parse(JSON.stringify([...array])));
export function getWeightedRandomItem(items) {
	const weights = items.reduce((acc, item, i) => {
		acc.push(item.weight + (acc[i - 1] ?? 0));
		return acc;
	}, []);
	const random = Math.random() * weights.at(-1);
	return items[weights.findIndex(weight => weight > random)];
}
