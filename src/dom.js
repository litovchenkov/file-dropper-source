// Cache DOM elements
const localID = document.getElementById('local-id');
const remoteID = document.getElementById('remote-id');
const fileInput = document.getElementById('file-input');
const downloadBtn = document.getElementById('download-btn');
const copyBtn = document.getElementById('copy-btn');
const fileNameDisplay = document.getElementById('file-name');
const dropZone = document.getElementById('drop-zone');
const fileProgress = document.getElementById('file-progress');
const totalSize = document.getElementById('total-size');

fileProgress.style.display = 'none';

export { localID, remoteID, fileInput, downloadBtn, copyBtn, fileNameDisplay, dropZone, fileProgress, totalSize };