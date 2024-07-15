const searchInput = document.getElementById('search-input');
const searchResults = document.getElementById('search-results');
const albumCover = document.getElementsByClassName('album-cover');
const playIcons = document.querySelectorAll('.playicon');
const timerElement = document.getElementsByClassName('initial-timer')[0];
const playPauseButton = document.querySelector('.play-pause-btn');
const volumeControl = document.querySelector('.control-bar');
const progressBar = document.querySelector('.progress-bar');
let intervalId;
let timerPaused = false;
let timerValue = 0;
let currentlyPlaying = null;



searchInput.addEventListener('input', async (e) => {
    const query = e.target.value.trim();
    if (query.length >= 3) {
        try {
            const response = await fetch(`https://itunes.apple.com/search?term=${query}&limit=20`);
            const data = await response.json();
            const tracks = data.results.slice(0, 15);
            searchResults.innerHTML = '';
            tracks.forEach((track) => {
                const resultHTML = `
          <div>
            <img src="${track.artworkUrl60}" alt="song thumbnail">
            <h4>${track.trackName}</h4>
            <p>${track.artistName}</p>
            <audio src="${track.previewUrl}" id="audio-${track.trackId}"></audio>
            <button class="play-button" data-id="${track.trackId}">Play</button>
          </div>
        `;
                searchResults.insertAdjacentHTML('beforeend', resultHTML);
            });
            searchResults.style.display = 'block';
        } catch (error) {
            console.error(error);
        }
    } else {
        searchResults.style.display = 'none';
    }
});

searchResults.addEventListener('click', (e) => {
    if (e.target.classList.contains('play-button')) {
        if (currentlyPlaying) {
            currentlyPlaying.pause();
        }
        const trackId = e.target.dataset.id;
        const audioElement = document.getElementById(`audio-${trackId}`);
        audioElement.play();
        currentlyPlaying = audioElement;
        timerValue = 0;
        timerElement.innerText = formatTime(timerValue);
        progressBar.value = 0;
        intervalId = setInterval(() => {
            incrementTimer();
            const progress = (timerValue / 165) * 100;
            progressBar.value = progress;
        }, 1000);
        setTimeout(() => {
            clearInterval(intervalId);
        }, 165000);
    }
});

document.addEventListener('click', (e) => {
    if (e.target !== searchInput && e.target !== searchResults) {
        searchResults.style.display = 'none';
    }
});

function incrementTimer() {
    timerValue++;
    timerElement.innerText = formatTime(timerValue);
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secondsRemaining = seconds % 60;
    return `${minutes}:${String(secondsRemaining).padStart(2, '0')}`;
}

playPauseButton.addEventListener('click', () => {
    const audioElement = document.querySelector('audio');
    if (audioElement.paused) {
        audioElement.play();
        playPauseButton.src = './Assets/pause-button.png';
        if (timerPaused) {
            intervalId = setInterval(() => {
                incrementTimer();
                const progress = (timerValue / 165) * 100;
                progressBar.value = progress;
            }, 1000);
            timerPaused = false;
        }
    } else {
        audioElement.pause();
        playPauseButton.src = './Assets/player_icon3.png';
        clearInterval(intervalId);
        timerPaused = true;
    }
});

volumeControl.addEventListener('input', (e) => {
    const audioElement = document.querySelector('audio');
    audioElement.volume = e.target.value / 100;
});

function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.toggle('active');
}

playIcons.forEach((icon) => {
    icon.addEventListener('click', () => {
        if (currentlyPlaying) {
            currentlyPlaying.pause();
        }
        const title = icon.previousElementSibling.previousElementSibling.innerText;
        console.log(`Fetching song preview for: ${title}`);
        fetch(`https://itunes.apple.com/search?term=${title}&limit=1`)
            .then((response) => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
            })
            .then((data) => {
                if (data.results.length > 0) {
                    const songUrl = data.results[0].previewUrl;
                    const audio = new Audio(songUrl);
                    audio.play();
                    currentlyPlaying = audio;
                } else {
                    console.error(`No song preview found for: ${title}`);
                }
            })
            .catch((error) => {
                console.error(`Error fetching song preview: ${error}`);
            });
        timerValue = 0;
        timerElement.innerText = formatTime(timerValue);
        progressBar.value = 0;
        intervalId = setInterval(() => {
            incrementTimer();
            const progress = (timerValue / 165) * 100;
            progressBar.value = progress;
        }, 1000);
        setTimeout(() => {
            clearInterval(intervalId);
        }, 165000);
    });
});

window.onload = function () {
    document.getElementById("premium-pop-up").style.display = "block";
    document.getElementById("background-blur").style.display = "block";
    showPaymentGateway();
}

document.querySelector('.close-button').addEventListener('click', function () {
    document.getElementById("premium-pop-up").style.display = "none";
    document.getElementById("background-blur").style.display = "none";
});

