/**
 * @fileoverview A dictionary that maps W3C rules to their corresponding WCAG rules and error messages
 * @note This file is based on the WHATWG rules from the html-validator module 
 * @attributes ruleid, wcag, errorMsg, suggestMsg
 * @source https://html-validate.org/rules/index.html
 */

const W3CtoWCAG = [
	/** 
	 * {
	 *  ruleid: "message attribute in the JSON of the results",
	 * 	wcag: "WCAG 2.2 | 1.1.1", (if multiple, separate by comma and space)
	 * 	errorMsg: "Error message",
	 * 	suggestMsg: "Suggestion message"
	 * }
	 */
	{
		ruleid:`An “img” element must have an “alt” attribute`,
		wcag: "WCAG 2.2 | 1.1.1",
		errorMsg: "Image elements should have an alt attribute.",
		suggestMsg: `Please add an 'alt' attribute to your image element to ensure accessibility: <img src='...' alt=>`,
	},
	{
		ruleid: "Unclosed element",
		wcag: "WCAG 2.2 | 4.1.1",
		errorMsg: "Element must have a proper opening/closing tag.",
		suggestMsg: "Please add the appropriate HTML tag to complete.",
	},
	{
		ruleid: "Stray end tag",
		wcag: "WCAG 2.2 | 4.1.1",
		errorMsg: "Element must have a proper opening/closing tag.",
		suggestMsg: "Please add the appropriate HTML tag to complete.",
	},
	{
		ruleid: "Duplicate ID",
		wcag: "WCAG 2.2 | 4.1.1",
		errorMsg: "Element must have unique IDs.",
		suggestMsg: "Please make sure all your attributes have different and unique IDs.",
	},
	{
		ruleid: `Element “title” must not be empty.`,
		wcag: "WCAG 2.2 | 2.4.2",
		errorMsg: "Element title cannot be empty, must have text content",
		suggestMsg: "Please add a descriptive title to your content.",
	},
	{
		ruleid: "missing a required instance of child element",
		wcag: "WCAG 2.2 | 2.4.2",
		errorMsg: "Element title cannot be empty, must have text content",
		suggestMsg: "Please add a descriptive title to your content.",
	},
	{
		ruleid: "is missing a required instance of child element",
		wcag: "WCAG 2.2 | 2.4.2",
		errorMsg: "Web pages must have a descriptive and concise title that accurately reflects the topic or purpose of the page.",
		suggestMsg: "Please add a descriptive and concise title to your web page using the 'title' element within the 'head' section.",
	},
	{
		ruleid: `Consider adding a “lang” attribute to the “html” start tag to declare the language of this document.`,
		wcag: "WCAG 2.2 | 3.1.1",
		errorMsg: "You must programatically define the primary language of each page.",
		suggestMsg: "Please add a lang attribute to the HTML tag and state the primary language.",
	},
	{
		ruleid: `Element “area” is missing required attribute “alt”`,
		wcag: "WCAG 2.2 | 1.1.1",
		errorMsg: "'Area' elements should have an alt attribute.",
		suggestMsg: "Please add an 'alt' attribute to your area element to ensure accessibility.",
	},
	{
		ruleid: `Element “area” is missing required attribute “href”`,
		wcag: "WCAG 2.2 | 1.1.1",
		errorMsg: "'Area' elements should have an href attribute.",
		suggestMsg: "Make sure there is an 'href' present in your area element.",
	},
	{
		ruleid: "<input> element does not have a <label>",
		wcag: "WCAG 2.2 | 1.1.1",
		errorMsg: "Input is missing a label",
		suggestMsg: "Please add a label attribute to your input.",
	},
	{
		ruleid: "title text cannot be longer than 70 characters",
		wcag: "WCAG 2.2 | 2.4.2",
		errorMsg: "Title text cannot be longer than 70 characters.",
		suggestMsg: "Please limit your webpage title to below 70 characters for better SEO.",
	},
	{
		ruleid: "Anchor link must have a text describing its purpose",
		wcag: "WCAG 2.2 | 2.4.4",
		errorMsg: "Anchor link must have a text describing its purpose.",
		suggestMsg: "Please add either an 'alt' tribute inside your anchor link or a text describing it.",
	},
	{
		ruleid: "Empty Heading",
		wcag: "WCAG 2.2 | 2.4.6",
		errorMsg: "Headings cannot be empty.",
		suggestMsg: "Please make sure to provide descriptive headings for your content.",
	},
	{
		ruleid: "Heading level can only increase by one, expected <h2> but got <h3>",
		wcag: "WCAG 2.2 | 2.4.10",
		errorMsg: "Heading level can only increase by one.",
		suggestMsg: "Please check if your headings start at h1 and if it only increases one level at a time. (h1>h6)",
	},
	{
		ruleid: `Element “area” is missing required attribute “alt”`,
		wcag: "WCAG 2.2 | 1.1.1",
		errorMsg: "'Area' elements should have an alt attribute.",
		suggestMsg: "Please add an 'alt' attribute to your area element to ensure accessibility.",
	},
	{
		ruleid: `Element “area” is missing required attribute “href”`,
		wcag: "WCAG 2.2 | 1.1.1",
		errorMsg: "'Area' elements should have an href attribute.",
		suggestMsg: "Make sure there is an 'href' present in your area element.",
	},
	{
		ruleid: "<input> element does not have a <label>",
		wcag: "WCAG 2.2 | 1.1.1",
		errorMsg: "Input is missing a label",
		suggestMsg: "Please add a label attribute to your input.",
	},
	{
		ruleid: "<form> element must have a submit button",
		wcag: "WCAG 2.2 | 3.2.2",
		errorMsg: "Form elements must have a submit button",
		suggestMsg: "Please add submit button on your form group.",
	},
	{
		ruleid: "<textarea> element does not have a <label>",
		wcag: "WCAG 2.2 | 3.3.2",
		errorMsg: "Textarea is missing a label",
		suggestMsg: "Please add a label attribute to your input.",
	},
	{
		ruleid: "<input> element does not have a <label>",
		wcag: "WCAG 2.2 | 3.3.2",
		errorMsg: "Input is missing a label",
		suggestMsg: "Please add a label attribute to your input.",
	},
	{
		ruleid: "<select> element does not have a <label>",
		wcag: "WCAG 2.2 | 3.3.2",
		errorMsg: "Select is missing a label",
		suggestMsg: "Please add a label attribute to your input.",
	},
];

module.exports = W3CtoWCAG;