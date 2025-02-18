/**
 * @fileoverview A dictionary that maps WHATWG rules to their corresponding WCAG rules and error messages
 * @note This file is based on the WHATWG rules from the html-validator module 
 * @attributes ruleid, wcag, errorMsg, suggestMsg
 * @source https://html-validate.org/rules/index.html
 */

const WHATWGtoWCAG = [
	/** 
	 * {
	 *  ruleid: "ruleid attribute in the JSON of the results",
	 * 	wcag: "WCAG 2.2 | 1.1.1", (if multiple, separate by comma and space)
	 * 	errorMsg: "Error message",
	 * 	suggestMsg: "Suggestion message"
	 * }
	 */
	{ 
		ruleid: "area-alt",
		wcag: "WCAG 2.2 | 1.1.1, 2.4.4, 2.4.9",
		errorMsg: "'alt' attribute must be set and non-empty when the 'href' attribute is present (area-alt)",
		suggestMsg: "Please add an 'alt' and 'href' attribute to your area element to ensure accessibility."
	},
	{ 
		ruleid: "aria-hidden-body", 
		wcag: "WCAG 2.2 | 1.3.1",
		errorMsg: "aria-hidden must not be used on <body>",
		suggestMsg: "Please do not use aria-hidden attribute in the <body> element",
	},
	{ 
		ruleid: "aria-label-misuse", 
		wcag: "WCAG 2.2 | 4.1.2",
		errorMsg: "'aria-label' cannot be used on this element",
		suggestMsg: "Please do not use aria-label on this element"
	},
	{ 
		ruleid: "empty-heading", 
		wcag: "WCAG 2.2 | 2.4.6",
		errorMsg: "Headings cannot be empty.",
		suggestMsg: "Please make sure to provide descriptive headings for your content."
	},
	{ 
		ruleid: "empty-title", 
		wcag: "WCAG 2.2 | 2.4.2",
		errorMsg: "Title cannot be empty.",
		suggestMsg: "Please make sure to provide a descriptive title"
	},
	{ 
		ruleid: "hidden-focusable", 
		wcag: "WCAG 2.2 | 2.4.3, 4.1.2",
		errorMsg: "aria-hidden cannot be used on focusable elements",
		suggestMsg: "Please remove aria-hidden or remove the element"
	},
	{ 
		ruleid: "input-missing-label", 
		wcag: "WCAG 2.2 | 1.1.1",
		errorMsg: "Input is missing a label",
		suggestMsg: "Please add a label attribute to your input."
	},
	{ 
		ruleid: "meta-refresh", 
		wcag: "WCAG2 2.2 | 2.2.1, 2.2.4, 3.2.5",
		errorMsg: "Meta refresh should either be instant or not be used.",
		suggestMsg: "Please remove it if not necessary or set it to 0 seconds.",
	},
	{ 
		ruleid: "multiple-labeled-controls", 
		wcag: "WCAG 2.2 | 1.3.1, 4.1.2",
		errorMsg: "Label must not be associated with multiple controls.",
		suggestMsg: "Please make sure that each label is associated with only one control.",
	},
	{ 
		ruleid: "no-autoplay", 
		wcag: "WCAG 2.2 | 1.4.2, 2.2.2",
		errorMsg: "Autoplay should not be used as it can be disruptive to users.",
		suggestMsg: "Please remove the autoplay attribute from your media element.",
	},
	{ 
		ruleid: "wcag/h30", 
		wcag: "WCAG 2.2 | 1.1.1, 2.4.4, 2.4.9",
		errorMsg: "Anchor link must have a text describing its purpose.",
		suggestMsg: "Please add either an 'alt' tribute inside your anchor link or a text describing it."
	},
	{ 
		ruleid: "wcag/h32", 
		wcag: "WCAG 2.2 | 3.2.2",
		errorMsg: "Form elements must have a submit button",
		suggestMsg: "Please add submit button on your form group.",
	},
	{ 
		ruleid: "wcag/h36", 
		wcag: "WCAG 2.2 | 1.1.1",
		errorMsg: "Images used as submit buttons should have a non-empty alt attribute.",
		suggestMsg: "Please add an 'alt' attribute to your image element to ensure accessibility: <img src='...' alt='Submit button'>"
	},
	{ 
		ruleid: "wcag/h37", 
		wcag: "WCAG 2.2 | 1.1.1",
		errorMsg: "Image elements should have an alt attribute.",
		suggestMsg: `Please add an 'alt' attribute to your image element to ensure accessibility: <img src='...' alt=>`,
	},
	{ 
		ruleid: "wcag/h63", 
		wcag: "WCAG 2.2 | 1.3.1",
		errorMsg: "Header elements must have content and be properly nested.",
		suggestMsg: "Please add a valid scope attribute (row, col, rowgroup, colgroup) to your header element.",
	},
	{ 
		ruleid: "wcag/h67", 
		wcag: "WCAG 2.2 | 1.1.1",
		errorMsg: "Image elements should have an alt attribute.",
		suggestMsg: `Please add an 'alt' attribute to your image element to ensure accessibility: <img src='...' alt=>`,
	},
	{ 
		ruleid: "wcag/h71", 
		wcag: "WCAG 2.2 | 1.3.1, 3.3.2",
		errorMsg: "Fieldset must contain a legend element.",
		suggestMsg: "Please add a <legend> element to your fieldset.",
	},
	{ 
		ruleid: "long-title", 
		wcag: "WCAG 2.2 | 2.4.2",
		errorMsg: "Title text cannot be longer than 70 characters.",
		suggestMsg: "Please limit your webpage title to below 70 characters for better SEO.",
	},
	{ 
		ruleid: "heading-level", 
		wcag: "WCAG 2.2 | 2.4.10",
		errorMsg: "Heading level can only increase by one.",
		suggestMsg: "Please check if your headings start at h1 and if it only increases one level at a time. (h1>h6)",
	}
];

module.exports = WHATWGtoWCAG;