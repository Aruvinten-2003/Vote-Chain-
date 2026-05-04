const CANDIDATE_API = "http://localhost:5000/api/candidates";

function showCandidateMessage(message, type = "error") {
    const messageBox = document.getElementById("messageBox");
    if (!messageBox) return;

    messageBox.textContent = message;
    messageBox.className = `message ${type}`;
    messageBox.style.display = "block";
}

function clearCandidateMessage() {
    const messageBox = document.getElementById("messageBox");
    if (!messageBox) return;

    messageBox.textContent = "";
    messageBox.className = "message";
    messageBox.style.display = "none";
}

async function fetchCandidates() {
    const response = await fetch(CANDIDATE_API);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to fetch candidates");
    }

    return data.candidates || [];
}

async function addCandidate(candidateData) {
    const response = await fetch(CANDIDATE_API, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(candidateData)
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to add candidate");
    }

    return data;
}

async function deleteCandidate(candidateId) {
    const response = await fetch(`${CANDIDATE_API}/${candidateId}`, {
        method: "DELETE"
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to delete candidate");
    }

    return data;
}

function renderCandidateTable(candidates) {
    const tableBody = document.getElementById("candidateTableBody");
    if (!tableBody) return;

    if (candidates.length === 0) {
        tableBody.innerHTML = "<tr><td colspan='4'>No candidates found</td></tr>";
        return;
    }

    tableBody.innerHTML = candidates.map(candidate => `
        <tr>
            <td>${candidate.name}</td>
            <td>${candidate.party}</td>
            <td>${candidate.blockchainCandidateId}</td>
            <td>
                <button onclick="handleDeleteCandidate('${candidate._id}')" class="delete-btn">
                    Delete
                </button>
            </td>
        </tr>
    `).join("");
}

function renderCandidateCards(candidates) {
    const container = document.getElementById("candidateContainer");
    if (!container) return;

    if (candidates.length === 0) {
        container.innerHTML = "<p>No candidates found.</p>";
        return;
    }

    container.innerHTML = candidates.map(candidate => `
        <div class="candidate-card">
            <div class="candidate-img">
                ${
                    candidate.image
                        ? `<img src="${candidate.image}" alt="${candidate.name}" style="width:100%; height:100%; object-fit:cover; border-radius:14px;">`
                        : "Candidate Image"
                }
            </div>
            <h3>${candidate.name}</h3>
            <h4>${candidate.party}</h4>
            <p>Blockchain Candidate ID: ${candidate.blockchainCandidateId}</p>
        </div>
    `).join("");
}

async function loadCandidatesForAdmin() {
    clearCandidateMessage();

    try {
        const candidates = await fetchCandidates();
        renderCandidateTable(candidates);
    } catch (error) {
        showCandidateMessage(error.message || "Unable to load candidates", "error");
    }
}

async function loadCandidatesForVoter() {
    clearCandidateMessage();

    try {
        const candidates = await fetchCandidates();
        renderCandidateCards(candidates);
    } catch (error) {
        showCandidateMessage(error.message || "Unable to load candidates", "error");
    }
}

async function handleAddCandidate(event) {
    event.preventDefault();
    clearCandidateMessage();

    const name = document.getElementById("candidateName")?.value.trim();
    const party = document.getElementById("candidateParty")?.value.trim();
    const image = document.getElementById("candidateImage")?.value.trim();
    const blockchainCandidateId = document.getElementById("candidateBlockchainId")?.value.trim();

    if (!name || !party || blockchainCandidateId === "") {
        showCandidateMessage("Name, party, and blockchain candidate ID are required", "error");
        return;
    }

    try {
        const result = await addCandidate({
            name,
            party,
            image,
            blockchainCandidateId: Number(blockchainCandidateId)
        });

        showCandidateMessage(result.message || "Candidate added successfully", "success");

        const form = document.getElementById("candidateForm");
        if (form) form.reset();

        await loadCandidatesForAdmin();
    } catch (error) {
        showCandidateMessage(error.message || "Failed to add candidate", "error");
    }
}

async function handleDeleteCandidate(candidateId) {
    clearCandidateMessage();

    const confirmed = confirm("Are you sure you want to delete this candidate?");
    if (!confirmed) return;

    try {
        const result = await deleteCandidate(candidateId);
        showCandidateMessage(result.message || "Candidate deleted successfully", "success");
        await loadCandidatesForAdmin();
    } catch (error) {
        showCandidateMessage(error.message || "Failed to delete candidate", "error");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const candidateForm = document.getElementById("candidateForm");
    const candidateTableBody = document.getElementById("candidateTableBody");
    const candidateContainer = document.getElementById("candidateContainer");

    if (candidateForm) {
        candidateForm.addEventListener("submit", handleAddCandidate);
    }

    if (candidateTableBody) {
        loadCandidatesForAdmin();
    }

    if (candidateContainer) {
        loadCandidatesForVoter();
    }
});
