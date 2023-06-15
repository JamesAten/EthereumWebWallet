//SPDX-License-Identifier: MIT

pragma solidity 0.8.15;

contract SmartWebWallet {

    mapping(address => uint) public stipend;
    mapping(address => bool) public isAllowedToSend;

    address payable public owner;

    constructor() {
        owner = payable(msg.sender);
    }

    function getBalance() public view returns (uint) {
        return address(this).balance;
    }

    function setStipend(address _from, uint _amount) public {
        require(msg.sender == owner, "You are not the owner, rejecting transaction");
        stipend[_from] = _amount;
        isAllowedToSend[_from] = true;
    }

    function denySending(address _from) public {
        require(msg.sender == owner, "You are not the owner, rejecting transaction");
        isAllowedToSend[_from] = false;
    }

    function transfer(address payable _to, uint _amount) public {
        require(_amount <= address(this).balance, "You are trying to send more than the contract owns, rejecting transaction");
        if(msg.sender != owner) {
            require(isAllowedToSend[msg.sender], "You are not authorized to send, rejecting transaction");
            require(stipend[msg.sender] >= _amount, "You are trying to send more than you are authorized to send, rejecting transaction");
            stipend[msg.sender] -= _amount;

        }

        _to.transfer(_amount);
    }

    receive() external payable {}
}