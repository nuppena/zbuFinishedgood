/* eslint-disable @typescript-eslint/naming-convention */
const base64 = require('base-64');
const xlsx = require('xlsx');
const { Readable } = require('stream');
// Function to decode Base64 and convert to JSON
function base64ToJSON(base64Data) {
    // Decode Base64 data
    const decodedString = base64.decode(base64Data);

    // Read Excel file
    const workbook = xlsx.read(decodedString, { type: 'binary' });

    // Assuming there is only one sheet in the Excel file
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convert worksheet to JSON
    const jsonData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
 // Extract heading from the first row
 const heading = [jsonData[0][0].trim()];

    
    // Extract headers from the 3rd row
    const headers = jsonData[2].map(header => header.trim());

    // Initialize items array
    let items = [];let fileType={};
    fileType=jsonData[0];
    // Start extracting items from the 4th row
    for (let i = 3; i < jsonData.length; i++) {
        // Skip empty rows
        if (jsonData[i].every(cell => !(cell.toString()).trim())) {
            continue;
        }

        // Create item object
        const item = {};
        headers.forEach((header, index) => {
            item[header] = jsonData[i][index] || '';
        });
        items.push(item);

    }

    // Construct the JSON output object
    const jsonOutput = {
        headers: headers,
        items: items,
        heading: heading,
        fileType:fileType
    };

    return jsonOutput;
}
function base64ToStream(base64) {
    // Decode base64 string to a Buffer
    const buffer = Buffer.from(base64, 'base64');
 
    // Create a Readable stream from the Buffer
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null); // Signal the end of the stream
 
    return stream;
}
module.exports = { base64ToJSON,base64ToStream };