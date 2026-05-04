const ELECTION_API = "http://localhost:5000/api/elections";

function showResultsMessage(message, type = "error") {
    const messageBox = document.getElementById("messageBox");
    if (!messageBox) return;

    messageBox.textContent = message;
    messageBox.className = `message ${type}`;
    messageBox.style.display = "block";
}

function clearResultsMessage() {
    const messageBox = document.getElementById("messageBox");
    if (!messageBox) return;

    messageBox.textContent = "";
    messageBox.className = "message";
    messageBox.style.display = "none";
}

async function fetchCurrentElection() {
    const response = await fetch(`${ELECTION_API}/current`);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to fetch current election");
    }

    return data.election;
}

function renderResults(candidates) {
    const resultsContainer = document.getElementById("resultsContainer");
    const totalVotesElement = document.getElementById("totalVotes");

    if (!resultsContainer) return;

    const totalVotes = candidates.reduce((sum, candidate) => sum + candidate.voteCount, 0);

    if (totalVotesElement) {
        totalVotesElement.textContent = totalVotes;
    }

    if (candidates.length === 0) {
        resultsContainer.innerHTML = `<p>No candidates found.</p>`;
        return;
    }

    resultsContainer.innerHTML = candidates.map(candidate => {
        const percentage = totalVotes > 0
            ? ((candidate.voteCount / totalVotes) * 100).toFixed(1)
            : "0.0";

        return `
            <div class="result-item">
                <div class="result-top">
                    <span>${candidate.name}</span>
                    <span>${candidate.voteCount} votes</span>
                </div>
                <div class="bar">
                    <div class="fill" style="width:${percentage}%;"></div>
                </div>
                <div class="meta">${percentage}% • ${candidate.party}</div>
            </div>
        `;
    }).join("");
}

async function loadResultsPage() {
    clearResultsMessage();

    try {
        const election = await fetchCurrentElection();
        const candidates = await getAllCandidatesFromChain();

        const electionTitle = document.getElementById("electionTitle");
        const electionStatus = document.getElementById("electionStatus");

        if (electionTitle) {
            electionTitle.textContent = election?.title || "Election Results";
        }

        if (electionStatus) {
            electionStatus.textContent = election?.status || "Unknown";
        }

        renderResults(candidates);
    } catch (error) {
        showResultsMessage(error.message || "Failed to load results", "error");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    loadResultsPage();
});