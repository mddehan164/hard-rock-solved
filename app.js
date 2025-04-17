
function selectById(id){
    return document.getElementById(id);
};

const searchBtn  = selectById('search-btn');

searchBtn.addEventListener('click', ()=>{
    let searchInput = selectById('search-input').value;
    let showResults = selectById('show-results');

    fetch(`https://api.lyrics.ovh/suggest/${searchInput}`)
        .then(response => response.json())
        .then(data => {
            displayData(data);
            selectById('search-input').value = '';
        })
    .catch(error => console.error('Error:', error));

    function displayData(data) {
        let slicedData = data.data.slice(0, 10);
        showResults.innerHTML = '';
        if (slicedData.length === 0) {
            showResults.innerHTML = '<p class="text-center text-danger">No songs found. Please try a different keyword.</p>';
            return; // Stop further execution if no data
        }

          function showLyricsResult(artist, title, showLyrics) {
                fetch(`https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`)
                    .then(res => res.json())
                    .then(data2 => {
                        displayData2(data2);
                    })
                    .catch(err => console.log(err))
                    
                    function cleanLyrics(rawLyrics) {
                        return rawLyrics
                            .replace(/(n\/)+n/g, '\n')           // fix things like n/n/n
                            .replace(/\\n/g, '\n')               // remove literal \n if present
                            .replace(/(\r\n|\r|\n)+/g, '\n')     // normalize new lines
                            .replace(/\.{2,}/g, '…')             // replace ... or more dots with ellipsis
                            .replace(/ +/g, ' ')                 // multiple spaces → single space
                            .trim();                             // remove leading/trailing spaces
                    }

                    function displayData2(data2){
                        if(data2.lyrics){
                            const cleanedLyrics = cleanLyrics(data2.lyrics);
                            showLyrics.innerHTML = `<pre>${cleanedLyrics}</pre>`;
                        } else {
                            showLyrics.innerHTML = `<p class="text-danger">Lyrics not found 😢</p>`;
                        }
                    }
          }

        

        slicedData.forEach((e)=>{
            let singleResult = document.createElement('div');
            singleResult.className = "single-result row align-items-center my-3 p-3";
            let uniqueId = `get-lyrics-${e.id}`
            singleResult.innerHTML = `
                    <div style="width: 120px;">
                            <img style="width: 100%;" src="${e.album.cover_big}"" alt="">
                    </div>

                    <div class="col-md-7">
                        <h3 id="song-title" class="lyrics-name">${e.title_short}</h3>
                        <p class="author lead">Album by <span id="artist-name">${e.artist.name}</span></p>
                    </div>

                    <div class="col-md-3 text-md-right text-center">
                        <button id = "${uniqueId}" class="btn btn-success">Get Lyrics</button>
                    </div>

                    <div id = "show-lyrics-${uniqueId}" class = "text-center">

                    </div>
            `;

            showResults.appendChild(singleResult);
            let lyricsFetched = false;
            let lyricsVisible = false;

            const lyricsBtn = selectById(`get-lyrics-${e.id}`);
            const showLyrics = selectById(`show-lyrics-${uniqueId}`);

            lyricsBtn.addEventListener('click', () => {
                if (!lyricsVisible) {
                    // Show lyrics
                    showLyrics.style.display = 'block';
                    lyricsVisible = true;

                    if (!lyricsFetched) {
                        showLyrics.innerHTML = '<p class="text-muted">Loading lyrics...</p>';
                        showLyricsResult(e.artist.name, e.title_short, showLyrics);
                        lyricsFetched = true;
                    }
                } else {
                    // Hide lyrics
                    showLyrics.style.display = 'none';
                    lyricsVisible = false;
                }
            });

        })
    }

})
