// JavaScript
const recordButton = document.getElementById("record");
const stopButton = document.getElementById("stop");
const uploadButton = document.getElementById("upload");
const playButton = document.getElementById("play");
const audioPlayer = document.querySelector("audio");
const timestampDisplay = document.getElementById("timestamp");
const recordingsList = document.getElementById("recordings-list");

let recorder;
let audioChunks = [];
let startTime;
let stopTime;
let recordings = [];
let timerId;

recordButton.addEventListener("click", startRecording);
stopButton.addEventListener("click", stopRecording);
uploadButton.addEventListener("click", uploadRecording);
playButton.addEventListener("click", playLastRecording);

async function startRecording() {
  try {
    startTime = new Date();
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    recorder = new MediaRecorder(stream);

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        audioChunks.push(e.data);
      }
    };

    recorder.onstop = () => {
      stopTime = new Date();
      const duration = stopTime - startTime;
      displayTimestamp(duration);

      const audioBlob = new Blob(audioChunks, { type: "audio/mpeg" });
      audioPlayer.src = URL.createObjectURL(audioBlob);

      recordings.push({
        timestamp: new Date().toLocaleString(),
        duration: duration,
        audioBlob: audioBlob,
      });

      renderRecordings();
      playButton.disabled = false;
    };

    recorder.start();
    recordButton.disabled = true;
    stopButton.disabled = false;
    uploadButton.disabled = true;

    // Start the timer to update the timestamp display every second
    timerId = setInterval(() => {
      const currentTime = new Date();
      const duration = currentTime - startTime;
      displayTimestamp(duration);
    }, 1000);
  } catch (error) {
    console.error("Error accessing microphone:", error);
  }
}

function stopRecording() {
  recorder.stop();
  recordButton.disabled = false;
  stopButton.disabled = true;
  uploadButton.disabled = false;

  // Stop the timer when recording is stopped
  clearInterval(timerId);
}

function uploadRecording() {
  const audioBlob = new Blob(audioChunks, { type: "audio/mpeg" });
  const formData = new FormData();
  formData.append("audio", audioBlob, "recording.mp3");

  fetch("http://localhost:5001/upload", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data.message);
    })
    .catch((error) => {
      console.error("Error uploading file:", error);
    });
}

function displayTimestamp(duration) {
  const minutes = Math.floor(duration / 60000);
  const seconds = ((duration % 60000) / 1000).toFixed(0);
  timestampDisplay.innerHTML = `Recording duration: ${minutes}:${
    seconds < 10 ? "0" : ""
  }${seconds}`;
}

function renderRecordings() {
  console.log("Rendering recordings...");
  recordingsList.innerHTML = ""; // Clear the previous content

  recordings.forEach((recording, index) => {
    const recordingItem = document.createElement("div");
    recordingItem.innerHTML = `<p>Recording ${index + 1}</p>
                               <p>Timestamp: ${recording.timestamp}</p>
                               <p>Duration: ${formatDuration(
                                 recording.duration
                               )}</p>
                               <button onclick="playRecording(${index})">Play</button>`;
    recordingsList.appendChild(recordingItem);
  });
}

function playRecording(index) {
  const recording = recordings[index];
  if (recording) {
    audioPlayer.src = URL.createObjectURL(recording.audioBlob);
    audioPlayer.play();
  }
}

function playLastRecording() {
  if (recordings.length > 0) {
    const lastRecording = recordings[recordings.length - 1];
    audioPlayer.src = URL.createObjectURL(lastRecording.audioBlob);
    audioPlayer.play();
  }
}

function formatDuration(duration) {
  const minutes = Math.floor(duration / 60000);
  const seconds = ((duration % 60000) / 1000).toFixed(0);
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
}
