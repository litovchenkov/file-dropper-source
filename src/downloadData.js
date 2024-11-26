import { fileProgress, totalSize } from './dom';

// Handle data transfer from a connected peer and assemble the received file
function downloadData(conn) {
    let receivedChunks = []; // Array to store the received file chunks
    let totalChunks = 0; // Total number of chunks expected
    let fileName = ''; // Name of the file being received

    // Handle incoming data from the connection
    conn.on('data', data => {
        if (data.totalChunks) {
            // Set total chunks and file name
            totalChunks = data.totalChunks;
            fileName = data.name;

            // Display total file size in KB
            totalSize.innerText = `${Math.round(data.fileSize / 1024)}KB`;
        } else if (data.chunk) {
            // A file chunk is received
            receivedChunks[data.index] = data.chunk; // Store the chunk at its index

            // Acknowledge receipt of the chunk to the sender
            conn.send({ receivedIndex: data.index });

            // Update and display progress bar
            fileProgress.style.display = ''; // Ensure progress bar is visible
            const progress = Math.round((receivedChunks.filter(Boolean).length / totalChunks) * 100);
            fileProgress.value = progress; // Set progress percentage

            // Check if all chunks have been received
            if (receivedChunks.filter(Boolean).length === totalChunks) {
                // Combine chunks into a Blob to recreate the file
                const blob = new Blob(receivedChunks);

                // Create a downloadable URL for the Blob
                const url = URL.createObjectURL(blob);

                // Programmatically create an anchor element to trigger file download
                const a = document.createElement('a');
                a.href = url;
                a.download = fileName; // Use the original file name
                document.body.appendChild(a);
                a.click(); // Trigger the download

                // Remove the anchor element and revoke the Blob URL
                document.body.removeChild(a);
                URL.revokeObjectURL(url);

                // Reset received chunks and hide the progress bar
                receivedChunks = [];
                fileProgress.style.display = 'none';
            }
        }
    });

    // Handle errors during data transfer
    conn.on('error', error => alert(`Data transfer error: ${error.message}`));
}

export default downloadData;