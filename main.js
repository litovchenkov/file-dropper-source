import './style.css';
import Peer from 'peerjs';
import { customAlphabet } from 'nanoid';
const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz');

import chunkFile from './src/chunkFile';
import { localID, fileProgress } from './src/dom';

// Hide the file progress bar initially
fileProgress.style.display = 'none';

// Generate a unique local peer ID using nanoid
const localPeerId = nanoid(8);
localID.innerText = localPeerId; // Display the local peer ID in the UI

// File blob to hold the file to be transferred
export const fileBlob = { value: null };

// Initialize a PeerJS connection with the generated peer ID
export const peer = new Peer(localPeerId, {
    config: {
        // ICE server configurations for NAT traversal
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' },
            { urls: 'stun:stun3.l.google.com:19302' },
            { urls: 'stun:stun4.l.google.com:19302' },
            { urls: 'stun:stun.relay.metered.ca:80' },
            {
                urls: 'turn:freestun.net:3478', // TURN server
                username: 'free',
                credential: 'free',
            },
        ]
    }
});

// Handle incoming connection requests from other peers
peer.on('connection', conn => {
    conn.on('open', () => {
        // Check if a file is available for sending
        if (fileBlob.value) {
            const fileName = fileBlob.name || 'uploaded-file'; // Default file name if none provided
            const fileSize = fileBlob.value.size; // File size
            const chunks = chunkFile(fileBlob.value, 64 * 1024); // Split the file into 64KB chunks

            // Send metadata about the file to the receiving peer
            conn.send({ name: fileName, fileSize: fileSize, totalChunks: chunks.length });

            let currentChunk = 0;

            // Function to send the next chunk
            const sendChunk = () => {
                if (currentChunk < chunks.length) {
                    conn.send({ chunk: chunks[currentChunk], index: currentChunk });
                }
            };

            // Listen for acknowledgment from the receiver for each chunk
            conn.on('data', ack => {
                if (ack.receivedIndex === currentChunk) {
                    currentChunk++; // Move to the next chunk
                    sendChunk(); // Send the next chunk
                }
            });

            // Start sending the first chunk
            sendChunk();
        } else {
            // Notify the user if no file is selected
            alert('No file to send');
        }
    });

    // Handle connection errors
    conn.on('error', error => alert(`Connection error: ${error.message}`));
});

// Handle general PeerJS errors
peer.on('error', (error) => {
    alert(`PeerJS error: ${error.message}`);
});