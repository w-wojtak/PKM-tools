const express = require('express');
const app = express();
const port = 3000; // You can choose any available port

const fs = require('fs');
const path = require('path');
const cors = require('cors');
app.use(cors());

app.use(express.json()); // For parsing application/json

/**
 * Handles a POST request to the '/save-text' route for saving text and an optional link to a file.
 * This Express route receives data from an HTTP POST request, extracts the text, URL, and a flag
 * indicating whether to include the URL in the save operation from the request body.
 * It then calls the `appendTextToFile` function to append the text and, if requested, the URL,
 * to a file located at a specified directory path.
 * After processing, the route sends a response back to the client confirming the operation.
 * 
 * @param {Request} req - The Express request object containing the text, URL, and includeLink flag.
 * @param {Response} res - The Express response object used to send a response back to the client.
 */

app.post('/save-text', (req, res) => {
    const text = req.body.text;
    const url = req.body.url; // Receive the URL from the request
    const includeLink = req.body.includeLink; // Receive the includeLink flag
    const dirPath = 'Replace with your path'; // Replace with your directory path
    appendTextToFile(text, url, dirPath, includeLink);
    res.send('Text and link processed');
});

/**
 * Starts an Express server on a specified port.
 * This function is used to initiate the server and make it listen for incoming requests on the defined port.
 * It includes a callback function that logs a message to the console once the server successfully starts,
 * indicating the server is running and listening for requests at the specified localhost URL.
 * 
 * @param {number} port - The port number on which the Express server will listen for requests.
 */

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});

/**
 * Appends text and optionally a URL to a Markdown file with a date-specific filename.
 * This function generates a file name based on the current date, constructs the file path,
 * and appends the provided text to it. If the 'includeLink' flag is true, the URL is also appended.
 * It handles file creation if the file does not exist and ensures that new content is appropriately
 * formatted and placed within the file. The function specifically organizes content under a "## Highlights"
 * section and avoids duplicating URLs if they already exist in the file.
 * Error handling is implemented for both file reading and writing operations.
 * 
 * @param {string} text - The text content to be appended to the file.
 * @param {string} url - The URL to be optionally appended along with the text.
 * @param {string} dirPath - The directory path where the file is located or will be created.
 * @param {boolean} includeLink - A flag indicating whether to append the URL along with the text.
 */

function appendTextToFile(text, url, dirPath, includeLink) {
    const today = new Date();
    const dateString = today.toISOString().split('T')[0]; // 'YYYY-MM-DD'
    const fileName = `${dateString}.md`;
    const filePath = path.join(dirPath, fileName);
    const highlightsHeader = "## Highlights";

    fs.readFile(filePath, 'utf8', (readErr, data) => {
        if (readErr) {
            // File doesn't exist or other read error, create a new file
            let contentToWrite = `${highlightsHeader}\n\n${text}\n\n`;
            if (includeLink) {
                contentToWrite += `${url}\n\n`;
            }
            fs.writeFile(filePath, contentToWrite, (writeErr) => {
                if (writeErr) throw writeErr;
                console.log(`Created new file and saved text (and link) to ${fileName}`);
            });
        } else {

            prev_text = data.trim();

            if (!data.includes(highlightsHeader)) {
                // If "## Highlights" is not in the file, prepend it
                data = `${prev_text}\n\n${highlightsHeader}`;
            }

            if (includeLink && data.includes(url)) {
                // Split the file content at the first occurrence of the URL
                const parts = data.split(url);
                const beforeUrl = parts[0].trim();
                // Reassemble: Text before the URL + new text + URL + rest of the file
                const updatedContent = `${beforeUrl}\n\n${text}\n\n${parts.slice(1).join(url).trim()}`;
                fs.writeFile(filePath, updatedContent, (writeErr) => {
                    if (writeErr) throw writeErr;
                    console.log(`Appended text above existing link in ${fileName}`);
                });
            } else {
                // Append text at the end, include the link if it's not present and checkbox is checked
                let contentToAppend = data.trim() + `\n\n${text}\n\n`;
                if (includeLink && !data.includes(url) && !text.includes(url)) {
                    contentToAppend += `${url}\n\n`;
                }
                fs.writeFile(filePath, contentToAppend, (appendErr) => {
                    if (appendErr) throw appendErr;
                    console.log(`Appended text to ${fileName}`);
                });
            }
        }
    });
}



