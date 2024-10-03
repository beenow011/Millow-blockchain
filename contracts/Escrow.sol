//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

interface IERC721 {
    function transferFrom(address _from, address _to, uint256 _id) external;
}

contract Escrow {
    address public lender;
    address public inspector;
    address payable public seller;
    address public nftAddress;

    mapping(uint256 => bool) public isListed;

    constructor(
        address _nftAddress,
        address _lender,
        address _inspector,
        address payable _seller
    ) {
        nftAddress = _nftAddress;
        lender = _lender;
        inspector = _inspector;
        seller = _seller;
    }

    function list(uint256 _nftID) public {
        IERC721(nftAddress).transferFrom(msg.sender, address(this), _nftID);
        isListed[_nftID] = true;
    }
}
