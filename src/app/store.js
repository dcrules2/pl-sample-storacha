import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import * as cheerio from 'cheerio';

// URL of the HTML page to download
const url = 'https://http.cat/';

// Create __filename and __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path where the HTML, Images, and CSS files will be saved
const folderPath = path.join(__dirname, 'temp');
const imagesDir = path.join(folderPath, 'images');

// Function to create directories if they don't exist
async function createDirectories() {
    try {
        await fs.mkdir(folderPath, { recursive: true });
        console.log(`Directory created or already exists: ${folderPath}`);
        
        await fs.mkdir(imagesDir, { recursive: true });
        console.log(`Images directory created or already exists: ${imagesDir}`);
    } catch (error) {
        console.error('Error creating directories:', error);
        throw error; // Rethrow the error to handle it elsewhere
    }
}

// Function to download the HTML
async function downloadHTML(url) {
    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error('Error downloading the HTML:', error);
        throw error; // Rethrow the error to handle it elsewhere
    }
}

// Function to save HTML to a file
async function saveHTMLToFile(html) {
    const filePath = path.join(folderPath, 'index.html');
    try {
        await fs.writeFile(filePath, html);
        console.log(`HTML downloaded and saved to ${filePath}`);
        return filePath;
    } catch (error) {
        console.error('Error saving HTML to file:', error);
        throw error; // Rethrow the error to handle it elsewhere
    }
}

// Function to scrape images from the HTML content
async function scrapeImages(htmlFilePath) {
    try {
        const html = await fs.readFile(htmlFilePath, 'utf-8');
        const $ = cheerio.load(html);
        const imgElements = $('img');

        const imgPromises = [];
        imgElements.each((index, element) => {
            const imgUrl = $(element).attr('src');
            if (imgUrl) {
                const absoluteUrl = imgUrl.startsWith('http') ? imgUrl : `https://http.cat${imgUrl}`;
                const filename = path.basename(imgUrl);
                const filepath = path.join(imagesDir, filename);
                imgPromises.push(downloadImage(absoluteUrl, filepath));
            }
        });

        await Promise.all(imgPromises);
        console.log('All images downloaded successfully');
    } catch (error) {
        console.error('Error scraping images:', error);
        throw error; // Rethrow the error to handle it elsewhere
    }
}

// Function to download and save images
async function downloadImage(url, filepath) {
    try {
        const response = await axios({
            url,
            method: 'GET',
            responseType: 'arraybuffer' // Ensure binary data handling
        });

        await fs.writeFile(filepath, response.data);
        console.log(`Image downloaded successfully: ${filepath}`);
    } catch (error) {
        console.error(`Error downloading image from ${url}:`, error);
        throw error; // Rethrow the error to handle it elsewhere
    }
}

// Function to orchestrate the download and scraping
export default async function store() {
    try {
        await createDirectories();
        const html = await downloadHTML(url); // Pass the url here
        const htmlFilePath = await saveHTMLToFile(html);
        await scrapeImages(htmlFilePath);
        console.log('HTML and images processing completed successfully.');
    } catch (error) {
        console.error('Error storing the data:', error);
    }
}

// Start the process by calling store()
store();
