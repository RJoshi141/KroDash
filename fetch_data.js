// Import Azure Blob Storage SDK (use a bundler or include via <script> tag)
const { BlobServiceClient } = require('@azure/storage-blob');
require('dotenv').config();

// Connection string for your Azure Storage Account (keep this secure!)
const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;

// Names of the container and CSV files to fetch
const containerName = 'data';
const fileNames = ['400_households.csv', '400_products.csv', '400_transactions.csv'];

async function fetchAndCombineData() {
  const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
  const containerClient = blobServiceClient.getContainerClient(containerName);

  // Array to hold combined data from all CSV files
  let combinedData = [];

  // Fetch and parse data from each CSV file
  for (const fileName of fileNames) {
    const blobClient = containerClient.getBlobClient(fileName);
    const downloadBlockBlobResponse = await blobClient.download(0);
    const text = await streamToText(downloadBlockBlobResponse.readableStreamBody);

    // Parse CSV data
    const parsedData = parseCSV(text);

    // Append parsed data to combinedData array
    combinedData = combinedData.concat(parsedData);
  }

  // Display the combined data on the page
  populateTable(combinedData);
}

function parseCSV(text) {
  // A simple CSV parsing function (could use libraries like PapaParse)
  const lines = text.split('\n');
  const headers = lines[0].split(',');

  const data = [];
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === '') continue;
    const values = lines[i].split(',');
    const row = {};
    for (let j = 0; j < headers.length; j++) {
      row[headers[j].trim()] = values[j].trim();
    }
    data.push(row);
  }
  return data;
}

// Convert stream to text
async function streamToText(readableStream) {
  const chunks = [];
  for await (const chunk of readableStream) {
    chunks.push(chunk.toString());
  }
  return chunks.join('');
}

// Function to populate table with data
function populateTable(data) {
  const tableBody = document.querySelector('#dataTable tbody');
  tableBody.innerHTML = '';

  data.forEach((row) => {
    const tr = document.createElement('tr');
    Object.values(row).forEach((value) => {
      const td = document.createElement('td');
      td.textContent = value;
      tr.appendChild(td);
    });
    tableBody.appendChild(tr);
  });
}

// Function to sort the table by a specific column index
function sortTable(columnIndex) {
  const table = document.querySelector('#dataTable');
  const rows = Array.from(table.rows).slice(1);

  const ascending = table.getAttribute('data-sort') !== columnIndex.toString();

  rows.sort((a, b) => {
    const aValue = a.cells[columnIndex].innerText;
    const bValue = b.cells[columnIndex].innerText;
    return ascending ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
  });

  rows.forEach((row) => table.tbody.appendChild(row));

  // Toggle the sort order for the next click
  table.setAttribute('data-sort', ascending ? columnIndex.toString() : '');
}

// Function to filter the table based on input search
function filterTable() {
  const input = document.querySelector('#searchInput');
  const searchTerm = input.value;

  const filteredData = data.filter((row) => row['HSHD_NUM'] === searchTerm);

  populateTable(filteredData);
}

// Fetch and display data when the page loads
document.addEventListener('DOMContentLoaded', fetchAndCombineData);
