pragma solidity 0.5.8;

import "../node_modules/@openzeppelin/contracts/math/SafeMath.sol";

contract FlightSuretyData {
    using SafeMath for uint256;

    /********************************************************************************************/
    /*                                       DATA VARIABLES                                     */
    /********************************************************************************************/

    address private contractOwner;                                      // Account used to deploy contract
    bool private operational = true;                                    // Blocks all state changes throughout the contract if false
    mapping (address => bool) private authorizedCallers;

    uint256 private constant neededFunding = 10 ether;
    struct airline {
        bool isRegistered;
        uint256 fundingAmount;
        bool isFundingCompleted;
    }
    mapping(address => airline) airlines;

    /********************************************************************************************/
    /*                                       EVENT DEFINITIONS                                  */
    /********************************************************************************************/


    /**
    * @dev Constructor
    *      The deploying account becomes contractOwner
    */
    constructor(address firstAirline) public requireValidAddress(firstAirline) {
        contractOwner = msg.sender;
        airlines[firstAirline] = airline({
            isRegistered: true,
            fundingAmount: 0 ether,
            isFundingCompleted: false
        });
    }

    /********************************************************************************************/
    /*                                       FUNCTION MODIFIERS                                 */
    /********************************************************************************************/

    // Modifiers help avoid duplication of code. They are typically used to validate something
    // before a function is allowed to be executed.

    /**
    * @dev Modifier that requires the "operational" boolean variable to be "true"
    *      This is used on all state changing functions to pause the contract in
    *      the event there is an issue that needs to be fixed
    */
    modifier requireIsOperational() {
        require(operational, "Contract is currently not operational");
        _;  // All modifiers require an "_" which indicates where the function body will be added
    }

    /**
    * @dev Modifier that requires the "ContractOwner" account to be the function caller
    */
    modifier requireContractOwner() {
        require(msg.sender == contractOwner, "Caller is not contract owner");
        _;
    }

    modifier requireValidAddress(address target) {
        require(target != address(0), "Invalid address");
        _;
    }

    modifier requireAuthorizedCaller() {
        require(authorizedCallers[msg.sender], "Only authrized caller can call");
        _;
    }

    modifier requireRegisteredAirline(address airlineAddress) {
        require(airlines[airlineAddress].isRegistered, "Only registered airline can proceed");
        _;
    }

    modifier requireQualifiedAirline(address airlineAddress) {
        require(airlines[airlineAddress].isFundingCompleted, "Only funded airline can proceed");
        _;
    }

    /********************************************************************************************/
    /*                                       UTILITY FUNCTIONS                                  */
    /********************************************************************************************/

    /**
    * @dev Get operating status of contract
    *
    * @return A bool that is the current operating status
    */
    function isOperational() public view returns(bool) {
        return operational;
    }

    /**
    * @dev Sets contract operations on/off
    *
    * When operational mode is disabled, all write transactions except for this one will fail
    */
    function setOperatingStatus(bool mode) external requireContractOwner {
        operational = mode;
    }

    /********************************************************************************************/
    /*                                     SMART CONTRACT FUNCTIONS                             */
    /********************************************************************************************/

    function authorizeCaller(address appAddress) external requireContractOwner requireIsOperational requireValidAddress(appAddress) {
        authorizedCallers[appAddress] = true;
    }

   /**
    * @dev Add an airline to the registration queue
    *      Can only be called from FlightSuretyApp contract
    *
    */
    function registerAirline(address oldAirline, address newAirline) external
        requireIsOperational
        requireAuthorizedCaller
        requireQualifiedAirline(oldAirline)
    {
        airlines[newAirline] = airline({
            isRegistered: true,
            fundingAmount: 0 ether,
            isFundingCompleted: false
        });
    }

    function provideFunding(address airlineAddress) external payable
        requireIsOperational
        requireAuthorizedCaller
        requireRegisteredAirline(airlineAddress)
    {
        airline storage target = airlines[airlineAddress];
        target.fundingAmount += msg.value;
        if (target.fundingAmount >= 10 ether) target.isFundingCompleted = true;
    }

    function isAirline(address airlineAddress) external view returns(bool, uint256, bool) {
        airline storage target = airlines[airlineAddress];
        return (target.isRegistered, target.fundingAmount, target.isFundingCompleted);
    }

   /**
    * @dev Buy insurance for a flight
    *
    */
    function buy
                            (
                            )
                            external
                            payable
    {

    }

    /**
     *  @dev Credits payouts to insurees
    */
    function creditInsurees
                                (
                                )
                                external
                                pure
    {
    }

    /**
     *  @dev Transfers eligible payout funds to insuree
     *
    */
    function pay
                            (
                            )
                            external
                            pure
    {
    }

   /**
    * @dev Initial funding for the insurance. Unless there are too many delayed flights
    *      resulting in insurance payouts, the contract should be self-sustaining
    *
    */
    function fund
                            (
                            )
                            public
                            payable
    {
    }

    function getFlightKey
                        (
                            address airlineAddress,
                            string memory flight,
                            uint256 timestamp
                        )
                        internal
                        pure
                        returns(bytes32)
    {
        return keccak256(abi.encodePacked(airlineAddress, flight, timestamp));
    }

    /**
    * @dev Fallback function for funding smart contract.
    *
    */
    function()
                            external
                            payable
    {
        fund();
    }
}

