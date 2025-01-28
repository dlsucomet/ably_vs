const { JSDOM } = require("jsdom");
const defaultFontColor = "#000000"; // Black
const defaultBackgroundColor = "#ffffff"; // White

// Contrast Ratio equation retrieved from https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio
function getContrastRatio(color1, color2) {
  const luminance1 = getRelativeLuminance(color1);
  const luminance2 = getRelativeLuminance(color2);
  const contrastRatio =
    (Math.max(luminance1, luminance2) + 0.05) /
    (Math.min(luminance1, luminance2) + 0.05);
  return contrastRatio.toFixed(2);
}

// Relative Luminance equation retrieved from https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
function getRelativeLuminance(color) {
  // console.log("Getting relative luminance for color:", color);
  const rgb = parseColor(color);
  const [r, g, b] = rgb.map((c) => {
    let sRgb = c / 255;
    return sRgb <= 0.03928 // Should it be updated to 0.04045? Document say 0.03928 was from an older version but no practical effect on the calculations in accordance to the guidelines
      ? sRgb / 12.92
      : Math.pow((sRgb + 0.055) / 1.055, 2.4);
  });
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance;
}

function parseColor(color) {
  // console.log("Parsing color:", color);
  const hexMatch = color.match(/^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (hexMatch) {
    return hexMatch.slice(1).map((c) => parseInt(c, 16));
  }
  const rgbMatch = color.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  if (rgbMatch) {
    return rgbMatch.slice(1).map((c) => parseInt(c, 10));
  }
  const rgbaMatch = color.match(
    /^rgba\((\d+),\s*(\d+),\s*(\d+),\s*([0-9]*[.])?[0-9]+\)$/
  );
  if (rgbaMatch) {
    return rgbaMatch.slice(1, 4).map((c) => parseInt(c, 10));
  }
  throw new Error("Invalid color format: " + color);
}

function rgbToHex(rgb, type) {
  // console.log("Converting RGB to Hex:", rgb);
  const match = rgb.match(/(\d+),\s*(\d+),\s*(\d+)/);
  if (!match) {
    if (type === "text") {
      return defaultFontColor;
    } else if (type === "background") {
      return defaultBackgroundColor;
    } else {
      throw new Error("Invalid color type: " + type);
    }
  }
  const [r, g, b] = match.slice(1);
  const hexR = parseInt(r, 10).toString(16).padStart(2, "0");
  const hexG = parseInt(g, 10).toString(16).padStart(2, "0");
  const hexB = parseInt(b, 10).toString(16).padStart(2, "0");
  return `#${hexR}${hexG}${hexB}`;
}

function checkContrastRatio(color1, color2) {
  // console.log("Calculating contrast ratio between:", color1, color2);
  const contrastRatio = getContrastRatio(color1, color2); // is this redundant?
  return contrastRatio;
}

function getFontSize(element, window) {
  const computedStyle = window.getComputedStyle(element);
  let size = computedStyle.getPropertyValue("font-size");


  // Convert to pixels if necessary
  if (size.endsWith('em')) {
      const parentFontSize = getFontSize(element.parentElement, window);
      size = parseFloat(size) * parentFontSize;
  } else if (size.endsWith('rem')) {
      const rootFontSize = getFontSize(document.documentElement, window);
      size = parseFloat(size) * rootFontSize;
  } else if (size.endsWith('px')) {
      size = parseFloat(size);
  } else if (size.endsWith('%')) {
      const parentFontSize = getFontSize(element.parentElement, window);
      size = (parseFloat(size) / 100) * parentFontSize;
  } else {
      // Handle other units or default case
      size = parseFloat(size);
  }
  if (isNaN(size)) {
      return 16; // Default font size
  }
  return size;
} 
  
function appendElement(level, contrast, element, document) {
  if (element.textContent != "Process selected images") {
    const colorChecked = document.createElement("div");
    colorChecked.id = "ably-colorChecked";
    if (level == 11) {
      colorChecked.textContent =
        "The text '" +
        element.textContent +
        "' has a color contrast ratio of " +
        contrast +
        ", which is below the WCAG minimum for Level AA - Normal Text of 4.5";
    } else if (level == 12) {
      colorChecked.textContent =
        "The text '" +
        element.textContent +
        "' has a color contrast ratio of " +
        contrast +
        ", which is below the WCAG minimum for Level AAA - Normal Text of 7";
    } else if (level == 21) {
      colorChecked.textContent =
        "The text '" +
        element.textContent +
        "' has a color contrast ratio of " +
        contrast +
        ", which is below the WCAG minimum for Level AA - Large Text of 3";
    } else if (level == 22) {
      colorChecked.textContent =
        "The text '" +
        element.textContent +
        "' has a color contrast ratio of " +
        contrast +
        ", which is below the WCAG minimum for Level AA - Large Text of 4.5";
    }
    // console.log(colorChecked.textContent);
    return colorChecked.textContent;
  }
}

function getIndexes(element, html) {
  var elementLen = element.length;
  var startIndex = 0, index, indexes = [];
  while ((index = html.indexOf(element, startIndex)) > -1) {
      indexes.push(index);
      startIndex = index + elementLen;
  }
  return indexes;
}
  
function checkContrast(element, window, document, html, index) {
  let contrastIssue = "";
  // console.log("Checking contrast for element:", element.className);
  // Get the text and background colors of an element
  let textColor = rgbToHex(window.getComputedStyle(element).color, "text");
  // console.log("Text color:", textColor);

  let bgColor = rgbToHex(
    window.getComputedStyle(document.body).backgroundColor,
    "background"
  );
  // console.log("Background color:", bgColor);

  const contrastRatio = checkContrastRatio(textColor, bgColor);
  // console.log("Contrast ratio:", contrastRatio);

  // WCAG AA : 4.5 - Normal, 3 - Large
  // WCAG AAA : 7 - Normal, 4.5 - Large
  
  // console.log("Font Size: ", getFontSize(element, window));

  if (getFontSize(element, window) < 24) {
    // Normal Size
    if (contrastRatio < 4.5) {
      // Level AA
      contrastIssue += appendElement("11", contrastRatio, element, document);
      contrastIssue += "\n";
    }
    if (contrastRatio < 7) {
      // Level AAA
      contrastIssue += appendElement("12", contrastRatio, element, document);
      contrastIssue += "\n";
    }
  } else {
    // Large Size
    if (contrastRatio < 3) {
      // Level AA
      contrastIssue += appendElement("21", contrastRatio, element, document);
      contrastIssue += "\n";
    }
    if (contrastRatio < 4.5) {
      // Level AAA
      contrastIssue += appendElement("22", contrastRatio, element, document);
      contrastIssue += "\n";
    }
  }

  // Find the index of the element's HTML within the document's HTML
  // console.log(element)
  const elementStartIndex = index + (element.outerHTML).lastIndexOf(">" + element.textContent) + 1;
  const elementEndIndex = elementStartIndex + element.textContent.length;

  // Only return the element if it has a color contrast issue
  if (elementStartIndex < 1 || elementEndIndex < 1) {
    return {
      contrastIssue: "",
      start: -1,
      end: -1
    };
  } else {
    return {
      contrastIssue: contrastIssue,
      start: elementStartIndex,
      end: elementEndIndex         
    };
  }
}

function checkDocumentContrast(html) {
	// List of all the color contrast issues
	const colorContrastIssues = [];

	// Find all the elements with text content on the page
	const dom = new JSDOM(html);
	const document = dom.window.document;
	const window = dom.window;

	// Find all the elements with text content on the page
	const elements = document.querySelectorAll(
	  "p, span, h1, h2, h3, h4, h5, h6, li, a, button, label, small, strong, em, div, td, th, caption"
	);
	
  // Check the color contrast of each element
  let indexMap = {} // hashmap for duplicate elements
	elements.forEach(element => {

    // Finds all indexes of the element
    let indexes = getIndexes(element.outerHTML, html)
    let index = 0

    // checks if theres a duplicate and goes to the next one if it has been used
    if (indexMap[indexes] != null) {
      indexMap[indexes] += 1
      index = indexMap[indexes]
    } else if (indexes.length > 1) {
      indexMap[indexes] = 0
    }
    
    colorContrastIssues.push(checkContrast(element, window, document, html, indexes[index]))
  });

  // Remove element if there is no contrast issue
  for (let i = colorContrastIssues.length - 1; i >= 0; i--) {
    if (colorContrastIssues[i].contrastIssue === "") {
      colorContrastIssues.splice(i, 1);
    }
  }

	return colorContrastIssues;
}

module.exports = {checkDocumentContrast, getContrastRatio};