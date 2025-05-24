'use client';

import Link from "next/link";
import Image from "next/image";
import { ConnectedAddress } from "~~/components/ConnectedAddress";
import { RoleCarousel } from "~~/components/RoleCarousel";
import { useAccount } from "@starknet-react/core";

const Home = () => {
  const { isConnected } = useAccount();

  return (
    <div className="flex items-center flex-col flex-grow pt-10">
      <div className="px-5">
        <h1 className="text-center">
          <span className="block text-2xl mb-2">Welcome to</span>
          <span className="block text-4xl font-bold">Scaffold-Stark 2</span>
        </h1>
        <ConnectedAddress />
        <p className="text-center text-lg">
          Edit your smart contract{" "}
          <code className="bg-underline italic text-base font-bold max-w-full break-words break-all inline-block">
            YourContract.cairo
          </code>{" "}
          in{" "}
          <code className="bg-underline italic text-base font-bold max-w-full break-words break-all inline-block">
            packages/snfoundry/contracts/src
          </code>
        </p>
      </div>

      <div className="bg-container flex-grow w-full mt-16 px-8 py-12">
        <div className="flex justify-center items-center gap-12 flex-col sm:flex-row">
          {!isConnected ? (
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-4">Connect Your Wallet</h2>
              <p className="text-gray-600">Please connect your wallet to access FanFlux features</p>
            </div>
          ) : (
            <RoleCarousel />
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
