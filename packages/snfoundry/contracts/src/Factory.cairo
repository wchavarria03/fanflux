#[starknet::contract]
pub mod Factory {
    use openzeppelin_utils::interfaces::{IUniversalDeployerDispatcher, IUniversalDeployerDispatcherTrait};
    use starknet::{ContractAddress, get_caller_address};
    use starknet::class_hash::ClassHash;
    use core::traits::Into;

    #[storage]
    struct Storage {}

    #[constructor]
    fn constructor(ref self: ContractState) {}

    const UDC_ADDRESS: felt252 = 0x04a64cd09a853868621d94cae9952b106f2c36a3f81260f85de6696c6b050221;

    fn deploy(ref self: ContractState, name: felt252, symbol: felt252, supply: u256, class_hash: ClassHash) -> ContractAddress {
        let dispatcher = IUniversalDeployerDispatcher {
            contract_address: UDC_ADDRESS.try_into().unwrap()
        };

        let salt = 1234567879;
        let from_zero = true;
        let caller = get_caller_address();
        let calldata = array![
            name,
            symbol,
            supply.try_into().unwrap(),
            caller.into()
        ];

        dispatcher.deploy_contract(class_hash, salt, from_zero, calldata.span())
    }
}