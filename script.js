// Get DOM elements
let video = document.getElementById("video");
let startBtn = document.getElementById("startBtn");
let stopBtn = document.getElementById("stopBtn");
let clearBtn = document.getElementById("clearBtn");
let intervalInput = document.getElementById("interval");
let snapshotsContainer = document.getElementById("snapshots");

let snapInterval = null;

// 1️⃣ Access the camera
navigator.mediaDevices.getUserMedia({ video: true, audio: false })
    .then(stream => {
        video.srcObject = stream;  // show camera feed in video element
    })
    .catch(err => {
        alert("Error accessing camera: " + err);
    });

// 2️⃣ Start taking snapshots
startBtn.addEventListener("click", () => {
    let intervalSec = parseFloat(intervalInput.value) * 1000; // convert seconds to ms
    if (snapInterval) clearInterval(snapInterval);

    snapInterval = setInterval(() => {
        takeSnapshot();
    }, intervalSec);
});

// 3️⃣ Stop taking snapshots
stopBtn.addEventListener("click", () => {
    clearInterval(snapInterval);
});

// 4️⃣ Clear snapshot history
clearBtn.addEventListener("click", () => {
    snapshotsContainer.innerHTML = "";
});

// 5️⃣ Function to take a snapshot from camera
function takeSnapshot() {
    // create a canvas the same size as the video
    let canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // draw current video frame on canvas
    let ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // convert canvas to image URL
    let imgURL = canvas.toDataURL("image/png");

    // create a container for the image + download link
    let imgDiv = document.createElement("div");

    let img = document.createElement("img");
    img.src = imgURL;

    let downloadLink = document.createElement("a");
    downloadLink.href = imgURL;
    downloadLink.download = `snapshot_${Date.now()}.png`;
    downloadLink.innerText = "Download";

    imgDiv.appendChild(img);
    imgDiv.appendChild(downloadLink);

    snapshotsContainer.appendChild(imgDiv);
}
