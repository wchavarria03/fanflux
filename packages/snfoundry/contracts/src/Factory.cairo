use starknet::ContractAddress;
use starknet::class_hash::ClassHash;

#[starknet::interface]
pub trait IFactory<TContractState> {
    fn deploy(
        ref self: TContractState,
        name: felt252,
        symbol: felt252,
        supply: u256,
        class_hash: ClassHash,
    ) -> ContractAddress;
}

#[starknet::contract]
pub mod Factory {
    use core::traits::Into;
    use starknet::class_hash::ClassHash;
    use starknet::{ContractAddress, get_caller_address};
    use super::IFactory;

    #[starknet::interface]
    trait IUniversalDeployer<TContractState> {
        fn deployContract(
            ref self: TContractState,
            class_hash: ClassHash,
            salt: felt252,
            unique: bool,
            calldata_len: usize,
            calldata: Span<felt252>,
        ) -> ContractAddress;
    }

    #[storage]
    struct Storage {}

    #[constructor]
    fn constructor(ref self: ContractState) {}

    const UDC_ADDRESS: felt252 = 0x04a64cd09a853868621d94cae9952b106f2c36a3f81260f85de6696c6b050221;

    #[abi(embed_v0)]
    impl FactoryImpl of IFactory<ContractState> {
        fn deploy(
            ref self: ContractState,
            name: felt252,
            symbol: felt252,
            supply: u256,
            class_hash: ClassHash,
        ) -> ContractAddress {
            let dispatcher = IUniversalDeployerDispatcher {
                contract_address: UDC_ADDRESS.try_into().unwrap(),
            };

            let salt = 1234567879;
            let from_zero = true;
            let caller = get_caller_address();
            let calldata = array![name, symbol, supply.try_into().unwrap(), caller.into()];

            dispatcher.deployContract(class_hash, salt, from_zero, calldata.len(), calldata.span())
        }
    }
}
