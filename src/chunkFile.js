// Split file into smaller chunks of a specified size
function chunkFile(file, chunkSize) {
    const chunks = []; // Array to hold the resulting file chunks
    let start = 0; // Start position of the current chunk

    // Loop until the entire file is processed
    while (start < file.size) {
        // Calculate the end position for the current chunk
        const end = Math.min(start + chunkSize, file.size);

        // Extract the chunk using the slice method and add it to the array
        chunks.push(file.slice(start, end));

        // Update the start position for the next chunk
        start = end;
    }

    return chunks; // Return the array of chunks
}

export default chunkFile;