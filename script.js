const DATA_KEY = 'kiosk-feedback';
const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1549410061330153474/0HpmHa59GjtptwM-JENoMmFbZBMYZK6KZqCv1B310nn-ZaKKcRtwDF40uCMwdWalJnUF";

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

function sendToDiscord(data) {
    const message = formatDataForDiscord(data);
    
    fetch(DISCORD_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: message })
    }).then(() => {
        alert('Feedback submitted! Thank you!');
        document.querySelectorAll('.feedback-text').forEach(textarea => {
            textarea.value = '';
        });
        
        // Reset de sterren
        document.querySelectorAll('.star').forEach(star => {
            star.classList.remove('active');
        });
    }).catch(error => {
        console.error('Error:', error);
        alert('Error submitting feedback. Please try again.');
    });
}

function formatDataForDiscord(data) {
    let message = "📊 **NEW FEEDBACK SUBMISSION**\n\n";
    
    message += "**VOTES:**\n";
    message += `• Option 1: ${data.votes[1]} votes\n`;
    message += `• Option 2: ${data.votes[2]} votes\n`;
    message += `• Option 3: ${data.votes[3]} votes\n`;
    message += `• Option 4: ${data.votes[4]} votes\n\n`;
    
    message += "**RATINGS:**\n";
    for (let i = 1; i <= 4; i++) {
        message += `\n**Option ${i}:**\n`;
        if (data.ratings[i]) {
            const clarity = data.ratings[i].clarity && data.ratings[i].clarity.length > 0 ? data.ratings[i].clarity[0] : 'N/A';
            const findinfo = data.ratings[i].findinfo && data.ratings[i].findinfo.length > 0 ? data.ratings[i].findinfo[0] : 'N/A';
            const visual = data.ratings[i].visual && data.ratings[i].visual.length > 0 ? data.ratings[i].visual[0] : 'N/A';
            const usefulness = data.ratings[i].usefulness && data.ratings[i].usefulness.length > 0 ? data.ratings[i].usefulness[0] : 'N/A';
            
            message += `• Clarity: ${clarity} ⭐\n`;
            message += `• Find Info: ${findinfo} ⭐\n`;
            message += `• Visual Appeal: ${visual} ⭐\n`;
            message += `• Usefulness: ${usefulness} ⭐\n`;
        } else {
            message += `• No ratings provided\n`;
        }
    }
    
    message += "\n**FEEDBACK:**\n";
    let hasFeedback = false;
    for (let i = 1; i <= 4; i++) {
        if (data.feedback[i] && data.feedback[i].length > 0) {
            hasFeedback = true;
            message += `\n**Option ${i}:**\n`;
            data.feedback[i].forEach((fb, index) => {
                message += `${index + 1}. ${fb}\n`;
            });
        }
    }
    
    if (!hasFeedback) {
        message += "No feedback provided.\n";
    }
    
    message += `\n**Submitted:** ${new Date().toLocaleString()}`;
    
    return message;
}

let data = loadData();

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
    });
});
    
function updateUI() 
{ 
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
    
    const resultsSection = document.querySelector('.results-section');
    const submitBtn = document.createElement('button');
    submitBtn.textContent = 'Save & Submit Feedback';
    submitBtn.style.cssText = `
        width: 100%;
        padding: 15px;
        background: #4caf50;
        color: white;
        border: none;
        border-radius: 4px;
        font-size: 1.1em;
        font-weight: bold;
        cursor: pointer;
        margin-top: 20px;
    `;
    
    submitBtn.addEventListener('click', function() {
        sendToDiscord(data);
    });
    
    resultsSection.appendChild(submitBtn);
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
        }
    });
});