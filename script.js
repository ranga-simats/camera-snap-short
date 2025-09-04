// ====================== LOGIN & SIGNUP ======================
const loginPage = document.getElementById("loginPage");
const signupPage = document.getElementById("signupPage");
const dashboard = document.getElementById("dashboard");
const photoPdfPage = document.getElementById("photoPdfPage");
const camSnapPage = document.getElementById("camSnapPage");

document.getElementById("showSignup").onclick = () => {
  loginPage.style.display = "none";
  signupPage.style.display = "block";
};
document.getElementById("showLogin").onclick = () => {
  signupPage.style.display = "none";
  loginPage.style.display = "block";
};

document.getElementById("signupBtn").onclick = () => {
  const email = document.getElementById("signupEmail").value;
  const user = document.getElementById("signupUser").value;
  const pass = document.getElementById("signupPassword").value;

  if (email && user && pass) {
    localStorage.setItem("user", JSON.stringify({ email, user, pass }));
    alert("Account created! Please login.");
    signupPage.style.display = "none";
    loginPage.style.display = "block";
  } else {
    alert("Fill all fields!");
  }
};

document.getElementById("loginBtn").onclick = () => {
  const user = document.getElementById("loginUser").value;
  const pass = document.getElementById("loginPassword").value;
  const saved = JSON.parse(localStorage.getItem("user"));

  if (saved && saved.user === user && saved.pass === pass) {
    localStorage.setItem("loggedIn", "true");
    loginPage.style.display = "none";
    dashboard.style.display = "block";
  } else {
    document.getElementById("loginMsg").innerText = "Invalid credentials!";
  }
};

window.onload = () => {
  if (localStorage.getItem("loggedIn") === "true") {
    loginPage.style.display = "none";
    dashboard.style.display = "block";
  }
};
function logout() {
  localStorage.setItem("loggedIn", "false");
  dashboard.style.display = "none";
  loginPage.style.display = "block";
}

// ====================== NAVIGATION ======================
document.getElementById("openPhotoPdf").onclick = () => {
  dashboard.style.display = "none";
  photoPdfPage.style.display = "block";
};
document.getElementById("openCamSnap").onclick = () => {
  dashboard.style.display = "none";
  camSnapPage.style.display = "block";
};
function goDashboard() {
  photoPdfPage.style.display = "none";
  camSnapPage.style.display = "none";
  dashboard.style.display = "block";
}

// ====================== IMAGE TO PDF ======================
let uploadedImages = [];
document.getElementById("uploadImages").addEventListener("change", function(event) {
  const files = event.target.files;
  uploadedImages = [];
  const preview = document.getElementById("imagePreview");
  preview.innerHTML = "";

  Array.from(files).forEach(file => {
    const reader = new FileReader();
    reader.onload = function(e) {
      uploadedImages.push(e.target.result);
      const div = document.createElement("div");
      div.classList.add("draggable-item");
      div.innerHTML = `<img src="${e.target.result}" alt="Image">`;
      preview.appendChild(div);
    };
    reader.readAsDataURL(file);
  });

  Sortable.create(preview, {
    animation: 150,
    onEnd: () => {
      const reordered = [];
      document.querySelectorAll("#imagePreview img").forEach(img => reordered.push(img.src));
      uploadedImages = reordered;
    }
  });
});

document.getElementById("downloadPdfBtn").onclick = () => {
  if (uploadedImages.length === 0) {
    alert("Please upload images first!");
    return;
  }
  const pdf = new jspdf.jsPDF();
  uploadedImages.forEach((img, i) => {
    if (i > 0) pdf.addPage();
    pdf.addImage(img, "JPEG", 15, 15, 180, 160);
  });
  const pdfName = prompt("Enter PDF name:", "my_document");
  pdf.save((pdfName || "document") + ".pdf");
};

// ====================== CAM SNAP ======================
const video = document.getElementById("camera");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const snapshotsDiv = document.getElementById("snapshots");
const countdownEl = document.getElementById("countdown");

let snapInterval, countdownTimer, remaining, snapshots = [];

// Camera start
navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => { video.srcObject = stream; })
  .catch(err => alert("Camera error: " + err));

// Start snapping
document.getElementById("startSnap").onclick = () => {
  const intervalSec = parseInt(document.getElementById("intervalInput").value);
  if (!intervalSec || intervalSec < 1) { alert("Enter valid seconds!"); return; }

  remaining = intervalSec;
  countdownEl.innerText = remaining;
  countdownTimer = setInterval(() => {
    remaining--;
    countdownEl.innerText = remaining;
    if (remaining <= 0) remaining = intervalSec;
  }, 1000);

  snapInterval = setInterval(captureSnap, intervalSec * 1000);
};

// Stop snapping
document.getElementById("stopSnap").onclick = () => {
  clearInterval(snapInterval);
  clearInterval(countdownTimer);
  countdownEl.innerText = "";
};

// Capture
function captureSnap() {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  const imgUrl = canvas.toDataURL("image/png");

  snapshots.push(imgUrl);
  localStorage.setItem("snapshots", JSON.stringify(snapshots));
  renderSnapshots();
}

// Render snapshots
function renderSnapshots() {
  snapshotsDiv.innerHTML = "";
  snapshots.forEach((snap, i) => {
    const div = document.createElement("div");
    div.classList.add("draggable-item");
    div.innerHTML = `<img src="${snap}" alt="Snap ${i+1}" onclick="previewImage('${snap}')">`;
    snapshotsDiv.appendChild(div);
  });

  // Make snapshots draggable
  Sortable.create(snapshotsDiv, {
    animation: 150,
    onEnd: () => {
      const reordered = [];
      document.querySelectorAll("#snapshots img").forEach(img => reordered.push(img.src));
      snapshots = reordered;
      localStorage.setItem("snapshots", JSON.stringify(snapshots));
    }
  });
}

// Preview Modal
function previewImage(src) {
  const modal = document.getElementById("previewModal");
  const modalImg = document.getElementById("previewImg");
  modalImg.src = src;
  modal.style.display = "flex";
}
document.getElementById("closeModal").onclick = () => {
  document.getElementById("previewModal").style.display = "none";
};

// Download Snaps as PDF
document.getElementById("downloadCamPdfBtn").onclick = () => {
  if (snapshots.length === 0) {
    alert("No snapshots available!");
    return;
  }
  const pdf = new jspdf.jsPDF();
  snapshots.forEach((img, i) => {
    if (i > 0) pdf.addPage();
    pdf.addImage(img, "PNG", 15, 15, 180, 160);
  });
  const pdfName = prompt("Enter PDF name for snapshots:", "my_snaps");
  pdf.save((pdfName || "snapshots") + ".pdf");
};

// Load saved snapshots
window.addEventListener("load", () => {
  const saved = JSON.parse(localStorage.getItem("snapshots"));
  if (saved) { snapshots = saved; renderSnapshots(); }
});
