// Handle uploaded file by reading its content and updating the UI
function handleFile(file, fileBlob, fileNameDisplay) {
    if (file) {
        // Create a FileReader to read the file's content
        const reader = new FileReader();

        // Handle the file once it's fully read
        reader.onload = e => {
            // Create a Blob from the file's content and store it in fileBlob
            fileBlob.value = new Blob([e.target.result], { type: file.type });
            fileBlob.name = file.name;
        };

        // Handle any errors during file reading
        reader.onerror = error => {
            console.error('File reading error:', error); // Log the error for debugging
            alert(`File reading error: ${error.message}`); // Notify the user of the error
        };

        // Read the file as a binary data
        reader.readAsArrayBuffer(file);

        // Update the UI with the file name and size
        fileNameDisplay.innerText = `${file.name} (${Math.round(file.size / 1024)}KB)`;
    } else {
        // Notify the user if no file is selected
        alert('No file selected');
    }
}

export default handleFile;