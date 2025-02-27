// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

library MathLib {
    function add(uint a, uint b) public pure returns (uint) {
        return a + b;
    }
}

contract HelloWorld {
    using MathLib for uint;
    function sum(uint a, uint b) public pure returns (uint) {
        return a.add(b);
    }
}