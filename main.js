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
                urls: 'turn:freeturn.net:3478',
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

let fileBlob = null;
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

// Handle incoming connection
peer.on('connection', conn => {
    conn.on('open', () => {
        if (fileBlob) {
            const fileNameValue = fileInput.value.split('\\').pop();
            conn.send({ name: fileNameValue, data: fileBlob });
        } else {
            console.warn('No file to send');
        }
    });
    conn.on('error', error => console.error('Connection error:', error));
});

// Handle data transfer
function downloadData(conn) {
    conn.on('data', data => {
        try {
            if (data.data) {
                const blob = new Blob([data.data]);
                const url = URL.createObjectURL(blob);
    
                const a = document.createElement('a');
                a.href = url;
                a.download = data.name;
                document.body.appendChild(a);
                a.click();
    
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            } else {
                console.error('Received data does not contain a valid file.');
            }
        } catch (error) {
            console.error('Error processing received data:', error);
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
        fileName.innerText = file.name;
    } else {
        console.warn('No file selected');
    }
}

peer.on('error', (error) => {
    console.error('PeerJS error:', error);
});