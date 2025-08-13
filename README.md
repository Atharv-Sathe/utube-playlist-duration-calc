# YouTube Playlist Duration Calculator

A Chrome extension that calculates and displays the total duration of YouTube playlists.

## Files Structure

- `manifest.json` - Chrome extension manifest file
- `content.js` - Content script that runs on YouTube playlist pages

## Installation

### Clone the repository

```bash
git clone https://github.com/yourusername/utube-playlist-duration.git
```

### Load on Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right corner
3. Click "Load unpacked" and select the cloned directory
4. The extension will be loaded and ready to use

## Usage

Navigate to any YouTube playlist (e.g., `https://www.youtube.com/playlist?list=...`) and you will be able to see an overlay div, which displays the total duration of the playlist in the following format: `Total Duration: {day}:{hr}:{min}:{sec}`.

## Images
![Sample ScreenShot](image.png)
