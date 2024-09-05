import './style.css';
import Peer from 'peerjs';
import { nanoid } from 'nanoid';

// Cache DOM elements
const localID = document.getElementById('local-id');
const remoteID = document.getElementById('remote-id');
const fileInput = document.getElementById('file-input');
const downloadBtn = document.getElementById('download-btn');
const copyBtn = document.getElementById('copy-btn');

const uuid = nanoid(8);
localID.innerText = uuid;

// PeerJS configuration
const peer = new Peer(uuid, {
    config: {
        'iceServers': [
            {urls: 'stun:stun.l.google.com:19302'},
            {urls: 'stun:stun1.l.google.com:19302'},
            {urls: 'stun:stun2.l.google.com:19302'},
            {urls: 'stun:stun3.l.google.com:19302'},
            {urls: 'stun:stun4.l.google.com:19302'},
            {urls: 'stun:stun.relay.metered.ca:80'},
            {
                urls: 'turn:freeturn.net:3478',
                username: 'free',
                credential: 'free',
            },
        ]
    }
});

peer.on('error', (error) => {
    console.error('PeerJS error:', error);
});

// Copy local ID to clipboard
copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(localID.innerText).catch(error => {
        console.error('Error copying ID:', error);
    });
});

// Initialize connection variable
let conn = null;

// Handle download button click event
downloadBtn.addEventListener('click', () => {
    const peerID = remoteID.value.trim();
    if (peerID) {
        remoteID.value = '';
        conn = peer.connect(peerID);
        
        conn.on('open', () => handleData(conn));
        conn.on('error', error => console.error('Connection error:', error));
    } else {
        console.warn('No remote peer ID provided');
    }
});

// File handling
let fileBlob = null;
fileInput.addEventListener('change', event => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = e => {
            fileBlob = new Blob([e.target.result], { type: file.type });
        };
        reader.onerror = error => console.error('File reading error:', error);
        reader.readAsArrayBuffer(file);
    } else {
        console.warn('No file selected');
    }
});

// Handle incoming connection
peer.on('connection', connection => {
    conn = connection;
    conn.on('open', () => {
        if (fileBlob) {
            const fileObj = {
                name: fileInput.value.split('\\').pop(),
                data: fileBlob,
            };
            conn.send(fileObj);
        } else {
            console.warn('No file to send');
        }
    });
    conn.on('error', error => console.error('Connection error:', error));
});

// Handle data transfer
function handleData(connection) {
    connection.on('data', data => {
        try {
            const blob = new Blob([data.data]);
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = data.name;
            document.body.appendChild(a);
            a.click();

            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error processing received data:', error);
        }
    });

    connection.on('error', error => console.error('Data transfer error:', error));
}