#!/usr/bin/osascript -l JavaScript
// インデント以下の位置でコメント・コメント解除

// Settings
const CommentStyles = [
	{mark: "#", lang: ["Apache", "CoffeeScript", "Git Ignore", "Makefile", "Perl", "Ruby", "Shell Script"]},
	{mark: "//", lang: ["C++", "CSS", "Java", "JavaScript", "PHP", "Swift"]},
	{mark: "--", lang: ["SQL"]},
	{mark: ";", lang: ["Lisp"]},
];
const SP = " ";

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

	const {selection} = doc;
	const newline = newlineOfDocument(doc);
	const lines = doc.contents().substring(begin, end).split(newline);
	
	// 長すぎる行で処理が重くなるのを防ぐため80文字までに制限する
	const colLimit = 80;
	const linesHasComment = lines.some(line => line.substring(0, colLimit).trim().indexOf(mark) === 0);
	let newContents;
	if (linesHasComment) {
		newContents = lines.map(line => {
			const spacesMatch = line.match(/^\s+/);
			const markPos = line.indexOf(mark, spacesMatch ? spacesMatch[0].length : 0);
			if (markPos >= 0) {
				const hasExtraSpace = (line[markPos + mark.length] === SP);
				const begin = markPos + mark.length + (hasExtraSpace ? 1 : 0);
				line = line.substring(0, markPos) + line.substring(begin);
			}
			return line;
		}).join(newline);
	} else {
		const getCommonIndent = lines => {
			if (lines.length < 1 || lines[0].length < 1 || /[^\s]/.test(lines[0][0])) {
				return "";
			}
			const indent = lines[0][0];
			if (lines.every(line => line.indexOf(indent) === 0)) {
				return indent + getCommonIndent(lines.map(line => line.substring(1)));
			} else {
				return "";
			}
		};
		const indent = getCommonIndent(lines);
		newContents = lines.map(line => indent + mark + SP + line.substring(indent.length)).join(newline);
	}
	selection.range = [begin, end - begin];
	selection.contents = newContents;
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
