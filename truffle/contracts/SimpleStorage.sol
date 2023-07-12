// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleStorage {
    mapping(string => string) private hashMap;

    constructor() {
        // Add mapping entries for email hashes
        hashMap["eb67252b03a32f607bbde7e5f18a403cf30f89581bbef761efe6715ce2f403a8"] = "1d966fe47bd3da5b4337bb1fb0691f11110f601e1cb50301ab29578f0653b069";
    }

    function checkHash(string memory inputHash) public view returns (string memory) {
        return hashMap[inputHash];
    }
}
