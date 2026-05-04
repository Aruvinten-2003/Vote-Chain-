const VOTE_API = "http://localhost:5000/api/votes";
const CANDIDATE_API = "http://localhost:5000/api/candidates";
const ELECTION_API = "http://localhost:5000/api/elections";

function showVoteMessage(message, type = "error") {
    const messageBox = document.getElementById("messageBox");
    if (!messageBox) return;

    messageBox.textContent = message;
    messageBox.className = `message ${type}`;
    messageBox.style.display = "block";
}

function clearVoteMessage() {
    const messageBox = document.getElementById("messageBox");
    if (!messageBox) return;

    messageBox.textContent = "";
    messageBox.className = "message";
    messageBox.style.display = "none";
}

function getLoggedInUser() {
    const user = localStorage.getItem("loggedInUser");
    return user ? JSON.parse(user) : null;
}

function updateVoteStatusUI(user) {
    const voteStatus = document.getElementById("voteStatus");
    const welcomeUserName = document.getElementById("welcomeUserName");

    if (voteStatus) {
        voteStatus.textContent = user && user.hasVoted ? "Voted" : "Not Voted";
    }

    if (welcomeUserName && user) {
        welcomeUserName.textContent = user.fullName || "Voter";
    }
}

function updateElectionStatusUI(election) {
    const currentElectionTitle = document.getElementById("currentElectionTitle");
    const currentElectionStatus = document.getElementById("currentElectionStatus");

    if (currentElectionTitle) {
        currentElectionTitle.textContent = election?.title || "No election";
    }

    if (currentElectionStatus) {
        currentElectionStatus.textContent = election?.status || "Unknown";
    }
}

async function getCurrentElection() {
    const response = await fetch(`${ELECTION_API}/current`);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to load current election");
    }

    return data.election;
}

async function getCandidates() {
    const response = await fetch(CANDIDATE_API);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to load candidates");
    }

    return data.candidates || [];
}

async function saveVoteRecord(voteData) {
    const response = await fetch(`${VOTE_API}/cast`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(voteData)
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to record vote");
    }

    return data;
}

async function castVote(candidateId, blockchainCandidateId) {
    clearVoteMessage();

    try {
        const user = getLoggedInUser();

        if (!user) {
            showVoteMessage("You must log in before voting", "error");
            return;
        }

        if (!user.walletAddress || user.walletAddress.trim() === "") {
            showVoteMessage("Please connect MetaMask before voting", "error");
            return;
        }

        const election = await getCurrentElection();
        updateElectionStatusUI(election);

        if (election.status !== "open") {
            showVoteMessage("Voting is currently closed", "error");
            return;
        }

        const alreadyVotedOnChain = await checkWalletVotedOnChain(user.walletAddress);
        if (alreadyVotedOnChain) {
            showVoteMessage("This wallet has already voted", "error");
            user.hasVoted = true;
            localStorage.setItem("loggedInUser", JSON.stringify(user));
            updateVoteStatusUI(user);
            disableAllVoteButtons();
            return;
        }

        const txHash = await voteOnChain(blockchainCandidateId);

        const result = await saveVoteRecord({
            userId: user.id,
            electionId: election._id,
            candidateId,
            walletAddress: user.walletAddress,
            transactionHash: txHash
        });

        user.hasVoted = true;
        localStorage.setItem("loggedInUser", JSON.stringify(user));

        updateVoteStatusUI(user);
        showVoteMessage(result.message || "Vote cast successfully", "success");
        disableAllVoteButtons();
    } catch (error) {
        showVoteMessage(error.message || "Failed to cast vote", "error");
    }
}

function disableAllVoteButtons() {
    const buttons = document.querySelectorAll(".vote-btn");
    buttons.forEach((button) => {
        button.disabled = true;
        button.textContent = "Voted";
        button.style.opacity = "0.7";
        button.style.cursor = "not-allowed";
    });
}

function createCandidateCard(candidate, user) {
    const alreadyVoted = user && user.hasVoted;

    return `
        <div class="candidate-card">
            <div class="candidate-img">
                ${
                    candidate.image
                        ? `<img src="${candidate.image}" alt="${candidate.name}" style="width:100%; height:100%; object-fit:cover; border-radius:14px;">`
                        : `Candidate Image`
                }
            </div>
            <h3>${candidate.name}</h3>
            <h4>${candidate.party}</h4>
            <p>Blockchain Candidate ID: ${candidate.blockchainCandidateId}</p>
            <button
                class="vote-btn"
                onclick="castVote('${candidate._id}', ${candidate.blockchainCandidateId})"
                ${alreadyVoted ? "disabled" : ""}
                style="${alreadyVoted ? "opacity:0.7;cursor:not-allowed;" : ""}"
            >
                ${alreadyVoted ? "Voted" : "Vote Now"}
            </button>
        </div>
    `;
}

async function loadCandidatesForVoting() {
    clearVoteMessage();

    const container = document.getElementById("candidateContainer");
    if (!container) return;

    try {
        const candidates = await getCandidates();
        const user = getLoggedInUser();

        updateVoteStatusUI(user);

        if (candidates.length === 0) {
            container.innerHTML = `<p>No candidates found.</p>`;
            return;
        }

        container.innerHTML = candidates
            .map((candidate) => createCandidateCard(candidate, user))
            .join("");

        if (user && user.hasVoted) {
            disableAllVoteButtons();
        }
    } catch (error) {
        showVoteMessage(error.message || "Unable to load candidates", "error");
    }
}

async function loadVoterDashboardMeta() {
    try {
        const election = await getCurrentElection();
        updateElectionStatusUI(election);
    } catch (error) {
        updateElectionStatusUI(null);
    }

    const user = getLoggedInUser();
    updateVoteStatusUI(user);
}

document.addEventListener("DOMContentLoaded", () => {
    loadVoterDashboardMeta();
    loadCandidatesForVoting();
});