import fs from 'fs';
import rp from 'readline-promise';
const readline = rp.default;
const polishWords = JSON.parse(fs.readFileSync('polish.json', 'utf8'));
console.log(polishWords);

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

let reading = true;
while (reading) {
	let word = await rl.questionAsync('What word would you like to add?');
	if (word == 'null') {
		reading = false;
		break;
	}
	let meaning = await rl.questionAsync('What does it mean?');
	polishWords.push({ word, meaning });
	fs.writeFileSync('polish.json', JSON.stringify(polishWords, null, 4));
}

rl.close();
rl.on('close', function () {
	console.log('\nEnding session.');
	process.exit(0);
});
