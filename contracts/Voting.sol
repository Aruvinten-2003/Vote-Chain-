// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Voting {
    address public admin;
    bool public votingOpen;
    uint256 public candidateCount;

    struct Candidate {
        uint256 id;
        string name;
        string party;
        uint256 voteCount;
    }

    mapping(uint256 => Candidate) public candidates;
    mapping(address => bool) public hasVoted;

    event CandidateAdded(uint256 indexed candidateId, string name, string party);
    event VotingOpened();
    event VotingClosed();
    event VoteCast(address indexed voter, uint256 indexed candidateId);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    modifier whenVotingOpen() {
        require(votingOpen, "Voting is not open");
        _;
    }

    constructor() {
        admin = msg.sender;
        votingOpen = false;
        candidateCount = 0;
    }

    function addCandidate(string memory _name, string memory _party) public onlyAdmin {
        require(bytes(_name).length > 0, "Candidate name is required");
        require(bytes(_party).length > 0, "Candidate party is required");
        require(!votingOpen, "Cannot add candidates while voting is open");

        candidateCount++;

        candidates[candidateCount] = Candidate({
            id: candidateCount,
            name: _name,
            party: _party,
            voteCount: 0
        });

        emit CandidateAdded(candidateCount, _name, _party);
    }

    function openVoting() public onlyAdmin {
        require(candidateCount > 0, "No candidate added");
        require(!votingOpen, "The voting is already open");

        votingOpen = true;
        emit VotingOpened();
    }

    function closeVoting() public onlyAdmin {
        require(votingOpen, "Voting is already closed");

        votingOpen = false;
        emit VotingClosed();
    }

    function vote(uint256 _candidateId) public whenVotingOpen {
        require(!hasVoted[msg.sender], "You have already voted");
        require(_candidateId > 0 && _candidateId <= candidateCount, "Invalid candidate ID");

        hasVoted[msg.sender] = true;
        candidates[_candidateId].voteCount++;

        emit VoteCast(msg.sender, _candidateId);
    }

    function getCandidate(uint256 _candidateId)
        public
        view
        returns (
            uint256 id,
            string memory name,
            string memory party,
            uint256 voteCount
        )
    {
        require(_candidateId > 0 && _candidateId <= candidateCount, "Invalid candidate ID");

        Candidate memory candidate = candidates[_candidateId];
        return (
            candidate.id,
            candidate.name,
            candidate.party,
            candidate.voteCount
        );
    }

    function getAllCandidates() public view returns (Candidate[] memory) {
        Candidate[] memory result = new Candidate[](candidateCount);

        for (uint256 i = 1; i <= candidateCount; i++) {
            result[i - 1] = candidates[i];
        }

        return result;
    }

    function checkIfVoted(address _voter) public view returns (bool) {
        return hasVoted[_voter];
    }
}