const DATA_KEY = 'kiosk-feedback'; //De naam waaronder de data wordt opgeslagen

function loadData() 
{ //Laadt de opgeslagen gegevens wanneer de pagina wordt geopend
    const stored = localStorage.getItem(DATA_KEY); //Haalt data op die eerder is opgeslagen
    return stored ? JSON.parse(stored) : { //Als er data is opgeslagen wordt het omgezet van tekst naar object, anders wordt er een nieuw leeg opbject aangemaakt
        votes: { 1: 0, 2: 0, 3: 0, 4: 0},
        feedback: { 1: [], 2: [], 3: [], 4: []},
        ratings: { 1: { clarity: [], findinfo: [], visual: [], usefulness: [] }, 
                   2: { clarity: [], findinfo: [], visual: [], usefulness: [] },
                   3: { clarity: [], findinfo: [], visual: [], usefulness: [] },
                   4: { clarity: [], findinfo: [], visual: [], usefulness: [] } }
    };
}

function saveData(data) 
{ //Slaat data op in localStorage
    localStorage.setItem(DATA_KEY, JSON.stringify(data)); //Zet het object om in tekst zodat het kan worden opgeslagen
}

let data = loadData(); //Laad de opgeslagen data of start met lege data

document.querySelectorAll('.save-btn').forEach(btn =>
{
    btn.addEventListener('click', function()
    {
        const option = this.dataset.option; //Haalt de data-option waarde op
        const feedbackText = document.querySelector(`.feedback-text[data-option="${option}"]`).value; //Vindt de tekstbox voor deze optie en haalt de tekst op
        if (feedbackText.trim())
        {
            data.feedback[option].push(feedbackText); //Voegt de feedback toe aan de lijst
            document.querySelector(`.feedback-text[data-option="${option}"]`).value = ''; //Leegt de tekstbox
            saveData(data); //Sla de gewijzigde data op
        }
    });
});

document.querySelectorAll('.vote-btn').forEach(btn => 
{ //Vindt alle elementen met class="vote-btn", forEach = voor elk van deze buttons doe het volgende: 
    btn.addEventListener('click', function() 
    { //Luister naar klikken op deze knop, function() is wat er gebeurt als iemand klikt
        const option = this.dataset.option; //Haalt de data-option waarde op
        data.votes[option]++; //Verhoogt het aantal stemmen voor deze optie met 1
        const feedbackText = document.querySelector(`.feedback-text[data-option="${option}"]`).value; //Vindt de tekstbox voor deze optie en haalt de tekst op
        if (feedbackText.trim()) 
        { //Als er tekst is (zonder spaties)
            data.feedback[option].push(feedbackText); //Voegt de feedback toe aan de lijst
        }
        saveData(data); //Sla de gewijzigde data op
        updateUI(); //Update het scherm zodat de veranderingen zichtbaar zijn
    });
});
    
function updateUI() 
{ //Update alle zichtbare elementen
        document.querySelectorAll('.star').forEach(star => {
        star.classList.remove('active');
    });
    for (let i = 1; i <= 4; i++) 
    { //Update de stemmen-tellers, wordt 4 keer herhaalt
        document.querySelector(`.vote-count[data-option="${i}"]`).textContent = `Votes: ${data.votes[i]}`; //Zoek het element met data-option='i' en zet de tekst op "Votes: X", ${data.votes[i]} betekent: vul hier het aantal stemmen in 
    }
    updateChart(); //update de grafiek
}

let chart = null; //chart is een variabele die de grafiek opslaat. Start op null

function updateChart() //Maakt of update de grafiek
{
    const ctx = document.getElementById('votesChart').getContext('2d'); //Vindt de <canvas> element, wordt 2D getekend
    if (chart) 
    {
        chart.destroy();
    }
    chart = new Chart(ctx, 
        {
            type: 'bar', //Staafdiagram

            data: 
            {
                labels: ['Option 1: Dynamics', 'Option 2: Information', 'Option 3: Context', 'Option 4: Immersion'],
                datasets: [
                    {
                        label: 'Votes', //Wat in de legenda staat
                        data: [data.votes[1], data.votes[2], data.votes[3], data.votes[4]],
                        backgroundColor: ['#0082c0', '#00a4ef', '#5cb3ff', '#b3d9ff'] //Kleuren zijn de kleuren van de staven
                    }
                ]
            },
            options: 
            {
                responsive: true, //Pas aan aan het schermformaat
                plugins: 
                {
                    legend:
                    {
                        display: false //Toont de legenda niet 
                    }
                },
                scales: 
                {
                    y:
                    {
                        beginAtZero: true //Start de y-as op 0
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
        data.ratings[option][question].push(rating); // Voeg toe in plaats van overschrijven
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
});

const modal = document.getElementById("imageModal"); //Haalt de modal element op
const modalImg = document.getElementById("modalImage"); //Haalt de foto in de modal op
const closeBtn = document.querySelector(".close"); //Haalt de sluitknop op

document.querySelectorAll('.screenshots-container img').forEach(img => //Voor elke foto in .screenshots-container
{
    img.addEventListener('click', function() //Wanneer iemand op een foto klikt
    {
        modal.style.display = "block"; //Toont de modal
        modalImg.src = this.src; //Zet de geklikte foto in de modal
    });
});

closeBtn.addEventListener('click', function() //Wanneer iemand op de sluitknop klikt
{
    modal.style.display = "none"; //Verbergt de modal
});

window.addEventListener('click', function(event) //Wanneer iemand ergens op het scherm klikt
{
    if (event.target == modal) //Als ze op achtergrond van de modal klikken (niet op de foto of de sluitknop)
    {
        modal.style.display = "none"; //Verbergt de modal
    }
});

document.querySelectorAll('.undo-btn').forEach(btn =>
{
    btn.addEventListener('click', function()
    {
        const option = this.dataset.option; //Haalt de data-option waarde op
        if (data.votes[option] > 0)
        {
            data.votes[option]--; //Verlaagt het aantal stemmen voor deze optie met 1
            saveData(data); //Sla de gewijzigde data op
            updateUI(); //Update het scherm zodat de veranderingen zichtbaar zijn
        }
    });
});