const API_BASE_URL = 'https://api.alquran.cloud/v1';
const contentDiv = document.getElementById('content');

document.addEventListener('DOMContentLoaded', () => {
    fetchSurahs();
    window.addEventListener('popstate', handlePopState);
});

async function fetchSurahs() {
    try {
        showLoading();
        const response = await fetch(`${API_BASE_URL}/surah`);
        const data = await response.json();
        displaySurahs(data.data);
    } catch (error) {
        console.error('Error fetching surahs:', error);
        showError('Failed to load surahs. Please try again later.');
    } finally {
        hideLoading();
    }
}

function displaySurahs(surahs) {
    const ul = document.createElement('ul');

    surahs.forEach(surah => {
        const li = document.createElement('li');

        const surahEnglish = document.createElement('span');
        surahEnglish.textContent = `${surah.number}. ${surah.englishName}`;
        surahEnglish.style.fontSize = '1.5em'; // Set the same font size for English as Arabic

        const surahArabic = document.createElement('span');
        surahArabic.textContent = surah.name;
        surahArabic.className = 'arabic-text';

        li.appendChild(surahEnglish);
        li.appendChild(surahArabic);

        li.addEventListener('click', () => {
            fetchSurah(surah.number);
            window.history.pushState({ page: 'surah', surahNumber: surah.number }, null, null);
        });
        ul.appendChild(li);
    });

    contentDiv.innerHTML = '';
    contentDiv.appendChild(ul);
}

async function fetchSurah(surahNumber) {
    try {
        showLoading();
        const [arabicResponse, englishResponse] = await Promise.all([
            fetch(`${API_BASE_URL}/surah/${surahNumber}`),
            fetch(`${API_BASE_URL}/surah/${surahNumber}/en.sahih`)
        ]);
        const arabicData = await arabicResponse.json();
        const englishData = await englishResponse.json();
        displaySurah(arabicData.data, englishData.data);
    } catch (error) {
        console.error('Error fetching surah:', error);
        showError('Failed to load surah. Please try again later.');
    } finally {
        hideLoading();
    }
}

function displaySurah(arabicSurah, englishSurah) {
    const surahTextDiv = document.createElement('div');
    surahTextDiv.id = 'surah-text';

    const arabicTextDiv = document.createElement('div');
    arabicTextDiv.className = 'arabic-text';

    const englishTextDiv = document.createElement('div');
    englishTextDiv.className = 'english-text';

    let arabicIndex = 0;
    let englishIndex = 0;

    // Loop through Arabic verses
    while (arabicIndex < arabicSurah.ayahs.length || englishIndex < englishSurah.ayahs.length) {
        // Create div for Arabic verse
        if (arabicIndex < arabicSurah.ayahs.length) {
            const arabicAyahDiv = document.createElement('div');
            arabicAyahDiv.className = 'ayah';
            arabicAyahDiv.innerHTML = `<span class="verse-number">${arabicSurah.ayahs[arabicIndex].numberInSurah}</span> ${arabicSurah.ayahs[arabicIndex].text}`;
            arabicTextDiv.appendChild(arabicAyahDiv);
            arabicIndex++;
        }

        // Create div for English translation, if available
        if (englishIndex < englishSurah.ayahs.length && englishSurah.ayahs[englishIndex].numberInSurah === arabicIndex) {
            const englishAyahDiv = document.createElement('div');
            englishAyahDiv.className = 'ayah';
            englishAyahDiv.innerHTML = `<span class="verse-number">${englishSurah.ayahs[englishIndex].numberInSurah}</span> ${englishSurah.ayahs[englishIndex].text}`;
            englishTextDiv.appendChild(englishAyahDiv);
            englishIndex++;
        } else {
            // If no corresponding English translation, add an empty div for spacing
            const emptyDiv = document.createElement('div');
            emptyDiv.className = 'ayah';
            emptyDiv.innerHTML = '&nbsp;'; // Non-breaking space to occupy space
            englishTextDiv.appendChild(emptyDiv);
        }
    }

    // Append the mirrored Arabic and English text to the surahTextDiv
    surahTextDiv.appendChild(arabicTextDiv);
    surahTextDiv.appendChild(englishTextDiv);

    // Add back button functionality
    const backButton = document.createElement('button');
    backButton.innerHTML = '<i class="fas fa-arrow-left"></i> Back to Surahs';
    backButton.className = 'back-button';
    backButton.addEventListener('click', () => {
        fetchSurahs();
        window.history.pushState({ page: 'surahs' }, null, null);
    });

    // Clear contentDiv and append the surahTextDiv with heading and back button
    contentDiv.innerHTML = `<h2>${arabicSurah.englishName}</h2>`;
    contentDiv.appendChild(backButton);
    contentDiv.appendChild(surahTextDiv);
}

function showLoading() {
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'loading';
    loadingDiv.textContent = 'Loading...';
    contentDiv.innerHTML = '';
    contentDiv.appendChild(loadingDiv);
}

function hideLoading() {
    const loadingDiv = document.querySelector('.loading');
    if (loadingDiv) {
        contentDiv.removeChild(loadingDiv);
    }
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error';
    errorDiv.textContent = message;
    contentDiv.innerHTML = '';
    contentDiv.appendChild(errorDiv);
}

function handlePopState(event) {
    const state = event.state;
    if (state) {
        if (state.page === 'surahs') {
            fetchSurahs();
        } else if (state.page === 'surah') {
            fetchSurah(state.surahNumber);
        }
    } else {
        fetchSurahs();
    }
}
