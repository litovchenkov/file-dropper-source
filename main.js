import './style.css';
import Peer from 'peerjs';

const peer = new Peer({
    config: {
        'iceServers': [
            {url:'stun:stun.l.google.com:19302'},
            {url:'stun:stun1.l.google.com:19302'},
            {url:'stun:stun2.l.google.com:19302'},
            {url:'stun:stun3.l.google.com:19302'},
            {url:'stun:stun4.l.google.com:19302'},
            {url: "stun:stun.relay.metered.ca:80"},
            {
                urls: "turn:freeturn.net:3478",
                username: "free",
                credential: "free",
            },
        ]
    }
});

const localID = document.getElementById('local-id');
const remoteID = document.getElementById('remote-id');
const fileInput = document.getElementById('file-input');
const downloadBtn = document.getElementById('download-btn');
const copyBtn = document.getElementById('copy-btn');

copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(localID.innerText).catch(error => {
        console.error('Error copying ID to clipboard:', error);
    });
});

peer.on('open', id => {
    localID.innerText = id;
});

peer.on('error', (error) => {
    console.error('PeerJS error:', error);
});

let conn = null;

downloadBtn.addEventListener('click', () => {
    const peerID = remoteID.value;
    remoteID.value = '';
    conn = peer.connect(peerID);

    conn.on('open', () => {
        handleData(conn);
    });

    conn.on('error', (error) => {
        console.error('Connection error:', error);
    });
});

let fileBlob = null;
fileInput.addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const arrayBuffer = e.target.result;
            fileBlob = new Blob([arrayBuffer], { type: file.type });
        };
        reader.onerror = function(error) {
            console.error('File reading error:', error);
        };
        reader.readAsArrayBuffer(file);
    } else {
        console.warn('No file selected');
    }
});

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
            console.warn('No file blob to send');
        }
    });

    conn.on('error', (error) => {
        console.error('Connection error:', error);
    });
});

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
            console.error('Error handling received data:', error);
        }
    });

    connection.on('error', (error) => {
        console.error('Data receiving error:', error);
    });
}
