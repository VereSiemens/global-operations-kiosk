const DATA_KEY = 'kiosk-feedback';
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycby1kLd57v4wqk_2Oh7pzhdeT2tgvdU2hGbkCaf0Uryethcac_0l6R9Kh2fCV9H63L7i/exec";

function loadData() 
{ 
    const stored = localStorage.getItem(DATA_KEY);
    return stored ? JSON.parse(stored) : {
        votes: { 1: 0, 2: 0, 3: 0, 4: 0},
        feedback: { 1: [], 2: [], 3: [], 4: []},
        ratings: { 1: { clarity: [], findinfo: [], visual: [], usefulness: [] }, 
                   2: { clarity: [], findinfo: [], visual: [], usefulness: [] },
                   3: { clarity: [], findinfo: [], visual: [], usefulness: [] },
                   4: { clarity: [], findinfo: [], visual: [], usefulness: [] } }
    };
}

function saveData(data) 
{ 
    localStorage.setItem(DATA_KEY, JSON.stringify(data));
}

function sendToGoogleSheets(option, type, value) {
    const payload = {
        option: option,
        type: type,
        value: value
    };
    
    fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify(payload)
    }).catch(error => console.log('Data sent to Google Sheets'));
}

let data = loadData();

document.querySelectorAll('.save-btn').forEach(btn =>
{
    btn.addEventListener('click', function()
    {
        const option = this.dataset.option;
        const feedbackElement = document.querySelector(`.feedback-text[data-option="${option}"]`);
        if (!feedbackElement) return;
        
        const feedbackText = feedbackElement.value;
        
        if (feedbackText.trim())
        {
            data.feedback[option].push(feedbackText);
            feedbackElement.value = '';
            saveData(data);
            sendToGoogleSheets(option, 'feedback', feedbackText);
        }
    });
});

document.querySelectorAll('.vote-btn').forEach(btn => 
{ 
    btn.addEventListener('click', function() 
    { 
        const option = this.dataset.option;
        data.votes[option]++;
        
        const feedbackElement = document.querySelector(`.feedback-text[data-option="${option}"]`);
        if (feedbackElement) {
            const feedbackText = feedbackElement.value;
            if (feedbackText.trim()) 
            {
                data.feedback[option].push(feedbackText);
            }
        }
        
        saveData(data);
        updateUI();
        sendToGoogleSheets(option, 'vote', 1);
    });
});
    
function updateUI() 
{ 
    document.querySelectorAll('.star').forEach(star => {
        star.classList.remove('active');
    });
    
    for (let i = 1; i <= 4; i++) 
    { 
        document.querySelector(`.vote-count[data-option="${i}"]`).textContent = `Votes: ${data.votes[i]}`;
    }
    updateChart();
}

let chart = null;

function updateChart()
{
    const ctx = document.getElementById('votesChart').getContext('2d');
    if (chart) 
    {
        chart.destroy();
    }
    chart = new Chart(ctx, 
        {
            type: 'bar',

            data: 
            {
                labels: ['Option 1: Dynamics', 'Option 2: Information', 'Option 3: Context', 'Option 4: Immersion'],
                datasets: [
                    {
                        label: 'Votes',
                        data: [data.votes[1], data.votes[2], data.votes[3], data.votes[4]],
                        backgroundColor: ['#0082c0', '#00a4ef', '#5cb3ff', '#b3d9ff']
                    }
                ]
            },
            options: 
            {
                responsive: true,
                plugins: 
                {
                    legend:
                    {
                        display: false
                    }
                },
                scales: 
                {
                    y:
                    {
                        beginAtZero: true
                    }
                }
            }
        }
    );
}

document.querySelectorAll('.star').forEach(star =>
{
    star.addEventListener('click', function()
    {
        const starsContainer = this.closest('.rating-stars');
        if (!starsContainer) return;
        
        const option = starsContainer.getAttribute('data-option');
        const question = starsContainer.getAttribute('data-question');
        const rating = this.getAttribute('data-value');
        
        if (!data.ratings) {
            data.ratings = { 1: {}, 2: {}, 3: {}, 4: {} };
        }
        if (!data.ratings[option]) {
            data.ratings[option] = {};
        }
        
        if (!data.ratings[option][question]) {
            data.ratings[option][question] = [];
        }
        data.ratings[option][question].push(rating);
        saveData(data);
        sendToGoogleSheets(option, 'rating_' + question, rating);
        
        starsContainer.querySelectorAll('.star').forEach(s => 
        {
            if (s.getAttribute('data-value') <= rating) {
                s.classList.add('active');
            } else {
                s.classList.remove('active');
            }
        });
    });
});

document.addEventListener('DOMContentLoaded', function()
{
    updateUI();
});

const modal = document.getElementById("imageModal");
const modalImg = document.getElementById("modalImage");
const closeBtn = document.querySelector(".close");

document.querySelectorAll('.screenshots-container img').forEach(img =>
{
    img.addEventListener('click', function()
    {
        modal.style.display = "block";
        modalImg.src = this.src;
    });
});

closeBtn.addEventListener('click', function()
{
    modal.style.display = "none";
});

window.addEventListener('click', function(event)
{
    if (event.target == modal)
    {
        modal.style.display = "none";
    }
});

document.querySelectorAll('.undo-btn').forEach(btn =>
{
    btn.addEventListener('click', function()
    {
        const option = this.dataset.option;
        if (data.votes[option] > 0)
        {
            data.votes[option]--;
            saveData(data);
            updateUI();
            sendToGoogleSheets(option, 'undo_vote', 1);
        }
    });
});