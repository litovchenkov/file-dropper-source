import './style.css';
import Peer from 'peerjs';
import { nanoid } from 'nanoid';

// Cache DOM elements
const localID = document.getElementById('local-id');
const remoteID = document.getElementById('remote-id');
const fileInput = document.getElementById('file-input');
const downloadBtn = document.getElementById('download-btn');
const copyBtn = document.getElementById('copy-btn');
const fileName = document.getElementById('file-name');
const dropZone = document.getElementById('drop-zone');
const fileProgress = document.getElementById('file-progress');
const totalSize = document.getElementById('total-size');

fileProgress.style.display = 'none';

const uuid = nanoid(8);
localID.innerText = uuid;

// PeerJS configuration
const peer = new Peer(uuid, {
    config: {
        'iceServers': [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' },
            { urls: 'stun:stun3.l.google.com:19302' },
            { urls: 'stun:stun4.l.google.com:19302' },
            { urls: 'stun:stun.relay.metered.ca:80' },
            {
                urls: 'turn:freestun.net:3478',
                username: 'free',
                credential: 'free',
            },
        ]
    }
});

// Copy local ID to clipboard
copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(localID.innerText).catch(error => {
        console.error('Error copying ID:', error);
    });
});

// File handling
dropZone.addEventListener('dragover', (event) => {
    event.preventDefault();
    dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', (event) => {
    event.preventDefault();
    dropZone.classList.remove('dragover');
    
    const file = event.dataTransfer.files[0];
    handleFile(file);
});

fileInput.addEventListener('change', event => {
    const file = event.target.files[0];
    handleFile(file);
});

// Handle download button click event
downloadBtn.addEventListener('click', () => {
    const peerID = remoteID.value.trim();
    if (peerID) {
        remoteID.value = '';
        const conn = peer.connect(peerID);
        
        conn.on('open', () => downloadData(conn));
        conn.on('error', error => console.error('Connection error:', error));
    } else {
        console.warn('No remote peer ID provided');
    }
});

let fileBlob = null;
// Handle incoming connection
peer.on('connection', conn => {
    conn.on('open', () => {
        if (fileBlob) {
            const fileName = fileInput.value.split('\\').pop();
            const fileSize = fileInput.files[0].size;
            const chunks = chunkFile(fileBlob, 64 * 1024); // 64KB chunks
            conn.send({ name: fileName, fileSize: fileSize, totalChunks: chunks.length });

            chunks.forEach((chunk, index) => {
                conn.send({chunk: chunk, index: index});
            });
        } else {
            console.warn('No file to send');
        }
    });
    conn.on('error', error => console.error('Connection error:', error));
});

// Handle data transfer
function downloadData(conn) {
    let receivedChunks = [];
    let totalChunks = 0;
    let fileName = '';

    conn.on('data', data => {
        if (data.totalChunks) {
            totalChunks = data.totalChunks;
            fileName = data.name;
            totalSize.innerText = `${Math.round(data.fileSize / 1024)}KB`;
        } else if (data.chunk) {
            receivedChunks.push(data.chunk);

            fileProgress.style.display = '';
            const progress = Math.round((receivedChunks.length / totalChunks) * 100);
            fileProgress.value = progress;

            if (receivedChunks.length === totalChunks) {
                const blob = new Blob(receivedChunks);
                const url = URL.createObjectURL(blob);

                const a = document.createElement('a');
                a.href = url;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();

                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }
        }
    });

    conn.on('error', error => console.error('Data transfer error:', error));
}


// Handle file upload
function handleFile(file) {
    if (file) {
        const reader = new FileReader();
        reader.onload = e => {
            fileBlob = new Blob([e.target.result], { type: file.type });
        };
        reader.onerror = error => console.error('File reading error:', error);
        reader.readAsArrayBuffer(file);
        fileName.innerText = `${file.name} (${Math.round(file.size / 1024)}KB)`;
    } else {
        console.warn('No file selected');
    }
}

function chunkFile(file, chunkSize) {
    const chunks = [];
    let start = 0;
    while (start < file.size) {
        const end = Math.min(start + chunkSize, file.size);
        chunks.push(file.slice(start, end));
        start = end;
    }
    return chunks;
}

peer.on('error', (error) => {
    console.error('PeerJS error:', error);
});