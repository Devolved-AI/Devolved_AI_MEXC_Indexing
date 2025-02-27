// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

library AddLib {
    function add(uint a, uint b) public pure returns (uint) {
        return a + b;
    }
}

library SubLib {
    function sub(uint a, uint b) public pure returns (uint) {
        return a - b;
    }
}

contract HelloWorld {
    using AddLib for uint;
    using SubLib for uint;
    uint256 public storedValue;

    constructor(uint256 _initialValue) {
        uint temp = uint256(1).add(_initialValue);
        storedValue = temp.sub(_initialValue);
    }
}