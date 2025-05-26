#[starknet::contract]
pub mod Factory {
    use starknet::{ContractAddress, get_caller_address};
    use starknet::class_hash::ClassHash;
    use core::traits::Into;

    #[starknet::interface]
    trait IUniversalDeployer<TContractState> {
        fn deployContract(
            ref self: TContractState,
            class_hash: ClassHash,
            salt: felt252,
            unique: bool,
            calldata_len: usize,
            calldata: Span<felt252>
        ) -> ContractAddress;
    }

    #[storage]
    struct Storage {}

    #[constructor]
    fn constructor(ref self: ContractState) {}

    const UDC_ADDRESS: felt252 = 0x041a78e741e5af2fec34b695679bc6891742439f7afb8484ecd7766661ad02bf;

    #[external(v0)]
    pub fn deploy(ref self: ContractState, name: felt252, symbol: felt252, supply: u256, class_hash: ClassHash) -> ContractAddress {
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

        dispatcher.deployContract(class_hash, salt, from_zero, calldata.len(), calldata.span())
    }
}