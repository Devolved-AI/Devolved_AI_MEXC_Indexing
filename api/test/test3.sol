// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract HelloWorld {
    uint256 public storedValue;

    constructor(uint256 _initialValue) {
        storedValue = _initialValue;
    }
}