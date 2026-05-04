const ELECTION_API = "http://localhost:5000/api/elections";

function showElectionMessage(message, type = "error") {
    const messageBox = document.getElementById("messageBox");
    if (!messageBox) return;

messageBox.textContent = message;
messageBox.className = `message ${type}`;
messageBox.style.display = "block";
}

function clearElectionMessage() {
    const messageBox = document.getElementById("messageBox");
if (!messageBox) return;

messageBox.textContent = "";
messageBox.className = "message";
messageBox.style.display = "none";
}

async function fetchAllElections() {
    const response = await fetch(ELECTION_API);
    const data = await response.json();

if (!response.ok) {
    throw new Error(data.message || "Failed to fetch elections");
}

return data.elections || [];
}

async function fetchCurrentElection() {
    const response = await fetch(`${ELECTION_API}/current`);
    const data = await response.json();

if (!response.ok) {
    throw new Error(data.message || "Failed to fetch current election");
}

return data.election;
}

async function createElection(electionData) {
const response = await fetch(`${ELECTION_API}/create`, {
    method: "POST",
    headers: {
    "Content-Type": "application/json"
    },
    body: JSON.stringify(electionData)
});

const data = await response.json();

if (!response.ok) {
    throw new Error(data.message || "Failed to create election");
}

return data;
}

async function openElectionInMongo(electionId) {
const response = await fetch(`${ELECTION_API}/open/${electionId}`, {
    method: "PUT"
});

const data = await response.json();

if (!response.ok) {
    throw new Error(data.message || "Failed to open election");
}

return data;
}

async function closeElectionInMongo(electionId) {
const response = await fetch(`${ELECTION_API}/close/${electionId}`, {
    method: "PUT"
});

const data = await response.json();

if (!response.ok) {
    throw new Error(data.message || "Failed to close election");
}

return data;
}

async function deleteElection(electionId) {
const response = await fetch(`${ELECTION_API}/${electionId}`, {
    method: "DELETE"
});

const data = await response.json();

if (!response.ok) {
    throw new Error(data.message || "Failed to delete election");
}

return data;
}

function renderElectionTable(elections) {
    const tableBody = document.getElementById("electionTableBody");
    if (!tableBody) return;

if (elections.length === 0) {
    tableBody.innerHTML = `
    <tr>
        <td colspan="6" style="text-align:center;">No elections found.</td>
    </tr>
    `;
    return;
}

tableBody.innerHTML = elections.map(election => `
    <tr>
        <td>${election.title}</td>
        <td>${election.description || "-"}</td>
        <td>${election.status}</td>
        <td>${election.startDate ? new Date(election.startDate).toLocaleString() : "-"}</td>
        <td>${election.endDate ? new Date(election.endDate).toLocaleString() : "-"}</td>
        <td>
        <button class="open-btn" onclick="handleOpenElection('${election._id}')">Open</button>
        <button class="close-btn" onclick="handleCloseElection('${election._id}')">Close</button>
        <button class="delete-btn" onclick="handleDeleteElection('${election._id}')">Delete</button>
    </td>
    </tr>
`).join("");
}

async function loadElectionsForAdmin() {
    clearElectionMessage();

try {
    const elections = await fetchAllElections();
    renderElectionTable(elections);
} catch (error) {
    showElectionMessage(error.message || "Unable to load elections", "error");
}
}

async function loadCurrentElectionStatus() {
try {
    const election = await fetchCurrentElection();

    const titleElement = document.getElementById("currentElectionTitle");
    const statusElement = document.getElementById("currentElectionStatus");

    if (titleElement) titleElement.textContent = election.title || "No election";
    if (statusElement) statusElement.textContent = election.status || "Unknown";
} catch (error) {
    console.error("Failed to load current election:", error.message);
}
}

async function handleCreateElection(event) {
    event.preventDefault();
    clearElectionMessage();

    const title = document.getElementById("electionTitle")?.value.trim();
    const description = document.getElementById("electionDescription")?.value.trim();
    const startDate = document.getElementById("electionStartDate")?.value;
    const endDate = document.getElementById("electionEndDate")?.value;

if (!title) {
    showElectionMessage("Election title is required", "error");
    return;
}

try {
    const result = await createElection({
        title,
        description,
        startDate: startDate || null,
        endDate: endDate || null
    });

    showElectionMessage(result.message || "Election created successfully", "success");

    const form = document.getElementById("electionForm");
    if (form) form.reset();

    await loadElectionsForAdmin();
    await loadCurrentElectionStatus();
} catch (error) {
    showElectionMessage(error.message || "Failed to create election", "error");
}
}

async function handleOpenElection(electionId) {
    clearElectionMessage();

try {
    await openVotingOnChain();
    const result = await openElectionInMongo(electionId);

    showElectionMessage(result.message || "Election opened successfully", "success");
    await loadElectionsForAdmin();
    await loadCurrentElectionStatus();
} catch (error) {
    showElectionMessage(error.message || "Failed to open election", "error");
}
}

async function handleCloseElection(electionId) {
    clearElectionMessage();

try {
    await closeVotingOnChain();
    const result = await closeElectionInMongo(electionId);

    showElectionMessage(result.message || "Election closed successfully", "success");
    await loadElectionsForAdmin();
    await loadCurrentElectionStatus();
} catch (error) {
    showElectionMessage(error.message || "Failed to close election", "error");
}
}

async function handleDeleteElection(electionId) {
    clearElectionMessage();

const confirmed = confirm("Are you sure you want to delete this election?");
    if (!confirmed) return;

try {
    const result = await deleteElection(electionId);
    showElectionMessage(result.message || "Election deleted successfully", "success");
    await loadElectionsForAdmin();
    await loadCurrentElectionStatus();
} catch (error) {
    showElectionMessage(error.message || "Failed to delete election", "error");
}
}

document.addEventListener("DOMContentLoaded", () => {
    const electionForm = document.getElementById("electionForm");

if (electionForm) {
    electionForm.addEventListener("submit", handleCreateElection);
    loadElectionsForAdmin();
}

loadCurrentElectionStatus();
});