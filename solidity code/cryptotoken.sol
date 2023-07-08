//SPDX-License-Identifier: MIT
//SOHAN CODE 

import "https://github.com/Uniswap/solidity-lib/blob/master/contracts/libraries/TransferHelper.sol";
pragma solidity >=0.8.4 < 0.8.20;

interface IFactory {
    function createPair(address tokenA, address tokenB) external returns (address pair);
}

interface IRouter {
        function getAmountsOut(uint amountIn, address[] memory path)
        external
        view
        returns (uint[] memory amounts);
    

    function factory() external pure returns (address);

    function WETH() external pure returns (address);

    function addLiquidityETH(
        address token,
        uint256 amountTokenDesired,
        uint256 amountTokenMin,
        uint256 amountETHMin,
        address to,
        uint256 deadline
    )
        external
        payable
        returns (
            uint256 amountToken,
            uint256 amountETH,
            uint256 liquidity
        );

    function swapExactTokensForETHSupportingFeeOnTransferTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external;

    function swapExactETHForTokensSupportingFeeOnTransferTokens(
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external payable;

}

contract MyToken {
    
    ////////////////////////////////////////////////////
    
    string public name = "ClastroCompetes";
    string public symbol = "NEW_CLS3";
    uint8 public decimals = 9;
    uint256 public totalsupply = 10_000_000 * (10 ** decimals);

    address public Owner;
    
    mapping(address => uint256) public balanceOf;
    mapping (address => mapping(address => uint256)) public allowance;
    uint256 private BUY_TAX_RATE = 5;   // 5% buy tax
    uint256 private SELL_TAX_RATE = 10;  // 10% sell tax
    
    IRouter public router;
    address public pair;
    address[] WhiteListed;

    address public taxAddress = 0xE89145e7d9a9b6a4BCacb82659b8bE0e0fFC70A0;  // Address where the tax amount will be deposited
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Burn(address indexed from, uint256 value);
    event TransferOwnerShip(address indexed from,address indexed to);
    event Approval(address indexed owner, address indexed spender, uint value);
    
    ////////////////////////////////////////////////////
   
    constructor( address routerAddress) { 
       
        IRouter _router = IRouter(routerAddress);
        address _pair = IFactory(_router.factory()).createPair(address(this), _router.WETH()); //create a pair with BNB
        router = _router;
        pair = _pair;

        balanceOf[msg.sender] = totalsupply;
        Owner = msg.sender;
        WhiteListed.push(Owner);
        WhiteListed.push(pair);
        //WhiteListed.push(routerAddress);

    }
    

    ////////////////////////////////////////////////////

    modifier onlyOwner
    {
        require(msg.sender == Owner, "Only Owner can call this Function");
        _;
    }

    modifier Whitelisted
    {
        bool isWhiteListed = false;

        for(uint256 i = 0; i < WhiteListed.length; i++)
        {
            if(WhiteListed[i] == msg.sender)
            {
                isWhiteListed = true;
                break;
            }
        }

        require(isWhiteListed == true, "Can't Call by this Address");
        _;
    }

    ////////////////////////////////////////////////////
    fallback() external payable {}
    receive() external payable {}
    
    function withdrawNativeToken(uint256 amount) public onlyOwner{
       address msgSender = msg.sender;
       require(amount <= address(this).balance, string(abi.encodePacked("Not Sufficient Balance in the Contract. Current Balance is ", address(this).balance)));
       (bool success, ) = msgSender.call{value: amount}("");
       require(success, "Error Withdrawing...");
    }

function swapTokensForBNB(uint256 tokenAmount) public payable {
    address[] memory path = new address[](2);
    path[0] = address(this);
    path[1] = router.WETH();

    // Approve the token transfer to the router
    approve(address(router), tokenAmount);

    // Perform the swap
    try router.swapExactTokensForETHSupportingFeeOnTransferTokens(
        tokenAmount,
        0,
        path,
        address(this),
        block.timestamp + 300000
    ) {
        // Successfully swapped tokens for BNB. BNB is now in the contract balance
        // Transfer the BNB to the tax address
        uint256 bnbAmount = address(this).balance;
        (bool success, ) = taxAddress.call{value: bnbAmount}("");
        require(success, "Failed to transfer BNB to tax address");

    } catch {        // Swap failed, handle the error
        return;
    }
}


 function addLiquidity(uint256 tokenAmount, uint256 BNBamount) public Whitelisted payable 
    {

        approve(address(router), tokenAmount);

        try router.addLiquidityETH{value: BNBamount}(
            address(this),
            tokenAmount,
            0,
            0,
            Owner,
            block.timestamp + 1000
        ){} catch {return;}
    }

    //**********************************************

    function totalSupply() public view returns(uint256 Total_Supply)
    {
        return totalsupply;
    }

    function setBuyTax (uint bTax) public onlyOwner
    {
        BUY_TAX_RATE = bTax;
    }

    function setSellTax (uint sTax) public onlyOwner
    {
        SELL_TAX_RATE = sTax;
    }

    function printBuyTax() public view returns(uint BuyTax)
    {
        return BUY_TAX_RATE;
    }

    function printSellTax() public view returns(uint SellTax)
    {
        return SELL_TAX_RATE;
    }

    //**********************************************
    
    function WhiteListAddress(address Address_to_be_White_listed) public onlyOwner returns(string memory)
    {
      WhiteListed.push(Address_to_be_White_listed);
      return("Succesfully WhiteListed");
    }

    function CheckWhiteListedAddress(address See_Address_to_be_WhiteListed) public view returns(bool isWhiteListed)
    {
        isWhiteListed = false;

        for(uint256 i = 0; i < WhiteListed.length; i++)
        {
            if(WhiteListed[i] == See_Address_to_be_WhiteListed)
            {
                isWhiteListed = true;
                break;
            }
        }

        return isWhiteListed;
    }

    //**********************************************
    
    function transferFrom(address _from, address _to, uint256 _value) public returns(bool) 
    {
        require(_value <= balanceOf[_from], "Not enough balance");
        require(_value <= allowance[_from][msg.sender], "Not enough allowance");

        uint256 tax = 0;
        //uint256 transferAmount = _value;

        if (_from != Owner) {     // Sell transaction
            tax = (_value * SELL_TAX_RATE) / 100; // sell tax
        }

        balanceOf[_from] -= _value;
        balanceOf[_to] += (_value - tax);
        balanceOf[taxAddress] += tax;
        allowance[_from][msg.sender] -= _value;

        //swapTokensForBNB(tax);

        emit Transfer(_from, _to, _value);
        if (tax > 0) {
            emit Transfer(msg.sender, taxAddress, tax);  
        }
    
        return true;
    }

    function transfer(address _to, uint256 _value) public returns(bool)
    {
        require(_to != address(0), "Invalid address");
        require(_value > 0, "Invalid amount");
        require(balanceOf[msg.sender] >= _value, "Insufficient balance");
        
        uint256 tax = 0;
        uint256 transferAmount = _value;
        
        if (msg.sender != Owner) {     // Sell transaction
            tax = (_value * BUY_TAX_RATE) / 100; // sell tax
        }

        transferAmount = _value - tax;
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += transferAmount;
        balanceOf[taxAddress] += tax;
        
        //swapTokensForBNB(tax);
        
        emit Transfer(msg.sender, _to, transferAmount);
        
        if (tax > 0) {
            emit Transfer(msg.sender, taxAddress, tax);

        }
        
        return true;
    }
    
function approve(address spender, uint256 value) public returns (bool) {
        require(spender != address(0), "Invalid address");
        
        uint256 _value = value * (10 ** decimals);
        
        allowance[msg.sender][spender] = _value;
        
        emit Approval(msg.sender, spender, _value);
        
        return true;
    }

    function burn(uint256 _value) external onlyOwner{
        //transfer(0x000000000000000000000000000000000000dEaD, _value);
        
        totalsupply -= _value;
        
        emit Burn(msg.sender, _value);
    }

    function burnFrom(address from, uint256 _value) external onlyOwner{
       
        transferFrom(from, 0x000000000000000000000000000000000000dEaD, _value);
        totalsupply -= _value;
        emit Burn(msg.sender, _value);
    }

    function TransferOwnership(address _owner) public onlyOwner
    {
        emit TransferOwnerShip(Owner, _owner);
        Owner = _owner;
    }

    function RenounceOwner() public onlyOwner
    {
        emit TransferOwnerShip(Owner, address(0));
        TransferOwnership(address(0));
    
    }



}

