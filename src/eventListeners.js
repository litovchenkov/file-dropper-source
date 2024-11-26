import handleFile from './handleFile';
import downloadData from './downloadData';

import { localID, remoteID, fileInput, downloadBtn, copyBtn, fileNameDisplay, dropZone } from './dom';

// Import shared variables and the PeerJS instance
import { fileBlob, peer } from '../main';

// Copy the local peer ID to the clipboard when the copy button is clicked
copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(localID.innerText)
        .catch(error => alert(`Error copying ID: ${error.message}`)); // Handle clipboard errors
});

// Drag-and-drop functionality for file selection
// Highlight the drop zone when a file is dragged over it
dropZone.addEventListener('dragover', (event) => {
    event.preventDefault(); // Prevent default behavior to enable drop functionality
    dropZone.classList.add('dragover'); // Add visual feedback
});

// Remove highlight when the dragged file leaves the drop zone
dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover'); // Remove visual feedback
});

// Handle file drop into the drop zone
dropZone.addEventListener('drop', (event) => {
    event.preventDefault(); // Prevent default drop behavior
    dropZone.classList.remove('dragover'); // Remove visual feedback

    // Get the dropped file
    const file = event.dataTransfer.files[0];

    // Process the file
    handleFile(file, fileBlob, fileNameDisplay);
});

// Handle file selection using the file input element
fileInput.addEventListener('change', event => {
    // Get the selected file
    const file = event.target.files[0];

    // Process the file
    handleFile(file, fileBlob, fileNameDisplay);
});

// Handle the Download button click event
downloadBtn.addEventListener('click', () => {
    // Get the remote peer ID entered by the user
    const peerID = remoteID.value.trim();

    if (peerID) {
        // Clear the remote ID input field
        remoteID.value = '';

        // Establish a connection to the remote peer
        const conn = peer.connect(peerID);

        // Once the connection is open, initiate the file download
        conn.on('open', () => downloadData(conn));

        // Handle connection errors
        conn.on('error', error => alert(`Connection error: ${error.message}`));
    } else {
        // Notify the user if no peer ID is provided
        alert('No remote peer ID provided');
    }
});