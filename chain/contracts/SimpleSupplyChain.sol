// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title SimpleSupplyChain
 * @dev Simplified version for school project - no role enforcement
 */
contract SimpleSupplyChain {
    // --- DATA TYPES ---
    enum EventType {
        Harvest,
        Shipment,
        Processing,
        QualityCheck,
        Sale
    }

    struct Event {
        EventType eventType;
        address actor;
        uint256 timestamp;
        string dataHash;
    }

    struct Batch {
        uint256 id;
        address creator;
        string productType;
        uint256 creationTimestamp;
        Event[] history;
    }

    // --- STATE VARIABLES ---
    mapping(uint256 => Batch) public batches;
    uint256 public nextBatchId = 1;

    // --- EVENTS ---
    event BatchCreated(uint256 indexed batchId, address indexed creator, string productType);
    event EventRecorded(uint256 indexed batchId, EventType eventType, address indexed actor, string dataHash);

    // --- CORE FUNCTIONS ---
    /**
     * @notice Anyone can create a batch
     */
    function createBatch(string memory _productType) public returns (uint256) {
        uint256 batchId = nextBatchId;
        nextBatchId++;

        batches[batchId].id = batchId;
        batches[batchId].creator = msg.sender;
        batches[batchId].productType = _productType;
        batches[batchId].creationTimestamp = block.timestamp;

        emit BatchCreated(batchId, msg.sender, _productType);
        return batchId;
    }

    /**
     * @notice Record an event for a batch
     * @dev Anyone can record events - role enforcement moved to frontend
     */
    function recordEvent(
        uint256 _batchId,
        EventType _eventType,
        string memory _dataHash
    ) public {
        require(batches[_batchId].creator != address(0), "Batch does not exist");

        // Create the new event
        Event memory newEvent = Event({
            eventType: _eventType,
            actor: msg.sender,
            timestamp: block.timestamp,
            dataHash: _dataHash
        });

        // Add the event to the batch's history
        batches[_batchId].history.push(newEvent);

        emit EventRecorded(_batchId, _eventType, msg.sender, _dataHash);
    }

    // --- VIEW FUNCTIONS ---
    function getBatchHistoryCount(uint256 _batchId) public view returns (uint256) {
        return batches[_batchId].history.length;
    }

    function getBatchEvent(uint256 _batchId, uint256 _index) public view returns (Event memory) {
        require(_index < batches[_batchId].history.length, "Event index out of bounds");
        return batches[_batchId].history[_index];
    }

    function getBatch(uint256 _batchId) public view returns (uint256, address, string memory, uint256) {
        Batch storage batch = batches[_batchId];
        require(batch.creator != address(0), "Batch does not exist");
        return (batch.id, batch.creator, batch.productType, batch.creationTimestamp);
    }
}