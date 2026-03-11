import Header from "@editorjs/header";
import List from "@editorjs/list";
import CodeBox from "@editorjs/code";
import Quote from "@editorjs/quote";
import Embed from "@editorjs/embed";
import Table from "@editorjs/table";
import Delimiter from "@editorjs/delimiter";
import Warning from "@editorjs/warning";
import Marker from "@editorjs/marker";
import InlineCode from "@editorjs/inline-code";
import ImageTool from "@editorjs/image";

export const EDITOR_TOOLS = {
	header: {
		class: Header,
		config: {
			placeholder: "Enter a heading",
			levels: [2, 3, 4],
			defaultLevel: 2,
		},
	},
	list: {
		class: List,
		inlineToolbar: true,
	},
	code: CodeBox,
	quote: {
		class: Quote,
		inlineToolbar: true,
		config: {
			quotePlaceholder: "Enter a quote",
			captionPlaceholder: "Quote's author",
		},
	},
	embed: Embed,
	table: {
		class: Table,
		inlineToolbar: true,
	},
	delimiter: Delimiter,
	warning: Warning,
	marker: Marker,
	inlineCode: InlineCode,
	image: {
		class: ImageTool,
		config: {
			endpoints: {
				byFile: "http://localhost:5000/api/upload",
				byUrl: "http://localhost:5000/api/fetchUrl",
			},
		},
	},
};
