// YouTube Playlist Duration Calculator Content Script

const convertToSeconds = (time) => {
  const timeChunks = time.split(":");
  const n = timeChunks.length;
  let seconds = Number(timeChunks[n - 1]);
  let minutes = n > 1 ? Number(timeChunks[n - 2]) : 0;
  let hrs = n > 2 ? Number(timeChunks[n - 3]) : 0;
  return seconds + minutes * 60 + hrs * 3600;
};

const secondsToTime = (secs) => {
  let days = Math.floor(secs / 86400);
  secs %= 86400;
  let hrs = Math.floor(secs / 3600);
  secs %= 3600;
  let hrStr = String(hrs).padStart(2, "0");
  let minutes = Math.floor(secs / 60);
  secs %= 60;
  let minStr = String(minutes).padStart(2, "0");
  let secStr = String(secs).padStart(2, "0");
  return [days, hrStr, minStr, secStr];
};

const getVideoTimes = () => {
  const timeDivs = document.querySelectorAll(
    "ytd-playlist-video-renderer .badge-shape-wiz__text"
  );
  const timesInSeconds = [...timeDivs].map((div) => {
    const time = div.innerText;
    return convertToSeconds(time);
  });
  return timesInSeconds;
};

const displayTotalTime = (timesInSeconds) => {
  const totalTimeInSeconds = timesInSeconds.reduce(
    (accm, curVal) => curVal + accm,
    0
  );
  const time = secondsToTime(totalTimeInSeconds);
  const timeString = time.join(":");
  console.log("Total Playlist Duration : ", timeString);
  return timeString;
};

const createTimeNode = (timeStr) => {
  // Check if overlay already exists to avoid duplicates
  const existingOverlay = document.getElementById("playlist-duration-overlay");
  if (existingOverlay) {
    existingOverlay.querySelector(
      ".duration-text"
    ).textContent = `Total Duration: ${timeStr}`;
    return;
  }

  // Create overlay container
  const overlay = document.createElement("div");
  overlay.id = "playlist-duration-overlay";
  overlay.style.cssText = `
    position: fixed;
    top: 80px;
    right: 20px;
    background: rgba(0, 0, 0, 0.85);
    color: white;
    padding: 12px 16px;
    border-radius: 8px;
    font-family: 'Roboto', sans-serif;
    font-size: 14px;
    font-weight: 500;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    z-index: 9999;
    display: flex;
    align-items: center;
    gap: 12px;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: opacity 0.3s ease;
  `;

  // Create duration text
  const durationText = document.createElement("span");
  durationText.className = "duration-text";
  durationText.textContent = `Total Duration: ${timeStr}`;
  durationText.style.cssText = `
    color: #65c3f7;
    font-weight: 600;
  `;

  // Create close button
  const closeButton = document.createElement("button");
  closeButton.innerHTML = "×";
  closeButton.style.cssText = `
    background: none;
    border: none;
    color: #fff;
    font-size: 18px;
    font-weight: bold;
    cursor: pointer;
    padding: 0;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: background-color 0.2s ease;
  `;

  // Add hover effect to close button
  closeButton.addEventListener("mouseenter", () => {
    closeButton.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
  });

  closeButton.addEventListener("mouseleave", () => {
    closeButton.style.backgroundColor = "transparent";
  });

  // Add close functionality
  closeButton.addEventListener("click", () => {
    overlay.style.opacity = "0";
    setTimeout(() => {
      overlay.remove();
    }, 300);
  });

  // Assemble overlay
  overlay.appendChild(durationText);
  overlay.appendChild(closeButton);

  // Add to page
  document.body.appendChild(overlay);

  console.log("Overlay added to DOM with duration:", timeStr);
};

// Wait until all playlist video durations are loaded before calculating
function waitForPlaylistTimes() {
  return new Promise((resolve) => {
    const checkTimes = () => {
      const times = document.querySelectorAll(
        "ytd-playlist-video-renderer .badge-shape-wiz__text"
      );
      if (times.length > 0) {
        // If "ytd-continuation-item-renderer" (loading placeholder) does not exist,
        // it means all videos are loaded
        const lastVideo = document.querySelector("ytd-continuation-item-renderer");
        if (!lastVideo) {
          observer.disconnect(); // stop observing once loaded
          resolve();
        }
      }
    };

    // Observe DOM changes to detect when video durations are loaded
    const observer = new MutationObserver(() => {
      checkTimes();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Initial check
    checkTimes();
  });
}

// Main function to display playlist duration
async function wrapper() {

  await waitForPlaylistTimes(); // Wait until all video durations are available

  const timeStr = displayTotalTime(getVideoTimes());
  if (timeStr) {
    createTimeNode(timeStr);
  } else {
    console.log("No videos found in the playlist.");
  }
}

// URL change detection to re-run when navigating between playlists
let currentUrl = window.location.href;
const checkUrlChange = () => {
  if (window.location.href !== currentUrl) {
    currentUrl = window.location.href;
    if (currentUrl.includes("youtube.com/playlist")) {
      wrapper();
    }
  }
};
setInterval(checkUrlChange, 2000);

// Initial execution if the current page is already a playlist
if (currentUrl.includes("youtube.com/playlist")) {
  wrapper();
}
