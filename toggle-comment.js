#!/usr/bin/osascript -l JavaScript
// インデント以下の位置でコメント・コメント解除

// Settings
const CommentStyles = [
	{mark: "# ", lang: ["Apache", "CoffeeScript", "Git Ignore", "Makefile", "Perl", "Ruby", "Shell Script"]},
	{mark: "// ", lang: ["C++", "CSS", "Java", "JavaScript", "PHP", "Swift"]},
	{mark: "-- ", lang: ["SQL"]},
	{mark: "; ", lang: ["Lisp"]},
];

const app = Application("CotEditor");
app.includeStandardAdditions = true;

// get active document
const doc = app.documents[0];

toggleComment(doc);

function toggleComment(doc) {
	const lang = doc.coloringStyle();
	const style = CommentStyles.find(cs => cs.lang.includes(lang));
	if (!style) return;
	const {mark} = style;

	const [begin, end] = extendSelection(doc);

	const newline = newlineOfDocument(doc);
	const lines = doc.contents().substring(begin, end).split(newline);
	console.log(`selection has ${lines.length} lines`);

	const {selection} = doc;
	selection.range = [begin, end - begin];

// 	selection.contents = 
}

function extendSelection(doc) {
	const newline = newlineOfDocument(doc);
	const {selection} = doc;
	const contents = doc.contents();
	const [oBegin, oLen] = selection.range();
	const begin = (b => b < 0 ? 0 : b + newline.length)(contents.lastIndexOf(newline, oBegin - 1));
	const end = (e => e < 0 ? contents.length : e)(contents.indexOf(newline, oBegin + oLen));
	// console.log(`[${oBegin}, ${oBegin + oLen}] => [${begin}, ${end}]`);
	return [begin, end];
}

function newlineOfDocument(doc) {
	const le = doc.lineEnding();
	if (le === "LF") return "\n";
	if (le === "CR") return "\r";
	return "\r\n";
}
