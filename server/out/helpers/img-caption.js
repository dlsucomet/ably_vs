/**
 * @summary This file contains a function that generates an alt text for an image using BLIP API.
 */

// Import the path, fs, and dotenv modules 
const path = require('path');
const fs = require('fs'); 
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

// A function that generates an alt text for an image
async function suggestAltText(imgPath) {
  try {
    let imgData;
	// Check if the filename is a URL or a local file
    try {  
      if (imgPath.startsWith("http") || imgPath.startsWith("https")) {
        imgData = JSON.stringify({ url: imgPath });
      } else {
        imgData = fs.readFileSync(imgPath);
      }
    } catch (error) {
      return `. Unfortunately, we cannot find the image.`;
    }
    // Get the token from the environment
	  const token = process.env.BLIP_TOKEN;
    const response = await fetch(
        "https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-large",
        {
            headers: {
                Authorization: token,
                "Content-Type": "application/json",
            },
            method: "POST",
            body: imgData,
        }
    );
	  // Get the response from the API
    const result = await response.json();
	  // Get the generated text from the response and format it
    let generatedCaption = result[0].generated_text;
	  generatedCaption = generatedCaption
      .replace("there are ", "")
      .replace("there is ", "")
      .replace("arafed ", "")
      .replace("araffe ", "")
      .replace("araf ", "person")
      .replace("arafe ", "")
      .replace("araffes ", "people ")
      .replace("araffy ", "")
      .replace("araffed ", "")
	  generatedCaption = generatedCaption.charAt(0).toUpperCase() + generatedCaption.slice(1);
	  // Return the alt text as a string of the img tag
	  return `: <img src='${imgPath}' alt='${generatedCaption}'>`;
  } catch (error) {
    // If the image is not supported
    return `. Unfortunately, we cannot recommend an alt-text for this image.`
  }
}

module.exports = suggestAltText;