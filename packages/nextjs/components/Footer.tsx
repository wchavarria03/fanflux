import { BugAntIcon, Cog8ToothIcon, CurrencyDollarIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { FaucetButton } from "~~/components/scaffold-stark/FaucetButton";
import { FaucetSepolia } from "~~/components/scaffold-stark/FaucetSepolia";
import { BlockExplorer } from "~~/components/scaffold-stark/BlockExplorer";
import { BlockExplorerSepolia } from "~~/components/scaffold-stark/BlockExplorerSepolia";
import { useTargetNetwork } from "~~/hooks/scaffold-stark/useTargetNetwork";
import { useGlobalState } from "~~/services/store/store";
import { getTargetNetworks } from "~~/utils/scaffold-stark";

/**
 * Site footer
 */
export const Footer = () => {
  const nativeCurrencyPrice = useGlobalState(
    (state) => state.nativeCurrencyPrice,
  );
  const { targetNetwork } = useTargetNetwork();
  const isLocalNetwork = targetNetwork.id === getTargetNetworks()[0].id;
  const isSepoliaNetwork = targetNetwork.id === BigInt(5);
  const isMainnetNetwork = targetNetwork.id === BigInt(1);

  return (
    <div className="min-h-0 py-5 px-1 mb-11 lg:mb-0 bg-base-100">
      <div>
        <div className="fixed flex justify-between items-center w-full z-10 p-4 bottom-0 left-0 pointer-events-none">
          <div className="flex flex-col md:flex-row gap-2 pointer-events-auto">
            {isSepoliaNetwork && (
              <>
                <FaucetSepolia />
                <BlockExplorerSepolia />
              </>
            )}
            {isLocalNetwork && (
              <>
                <FaucetButton />
              </>
            )}
            {isMainnetNetwork && (
              <>
                <BlockExplorer />
              </>
            )}
            <Link
              href={"/configure"}
              passHref
              className="btn btn-sm font-normal gap-1 cursor-pointer border border-[#32BAC4] shadow-none"
            >
              <Cog8ToothIcon className="h-4 w-4 text-[#32BAC4]" />
              <span>Configure Contracts</span>
            </Link>
            <Link
              href={"/debug"}
              passHref
              className="btn btn-sm font-normal gap-1 cursor-pointer border border-[#32BAC4] shadow-none"
            >
              <BugAntIcon className="h-4 w-4 text-[#32BAC4]" />
              <span>Debug Contracts</span>
            </Link>
            {nativeCurrencyPrice > 0 && (
              <div>
                <div className="btn btn-sm font-normal gap-1 cursor-auto border border-[#32BAC4] shadow-none">
                  <CurrencyDollarIcon className="h-4 w-4 text-[#32BAC4]" />
                  <span>{nativeCurrencyPrice}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="w-full">
        <ul className="menu menu-horizontal w-full">
          <div className="flex justify-center items-center gap-2 text-sm w-full">
            <div className="text-center">
              <span className="text-base-content/60">Powered by FanFlux</span>
            </div>
            <div className="text-center">
              <a
                href="https://github.com/fanflux"
                target="_blank"
                rel="noreferrer"
                className="link"
              >
                GitHub
              </a>
            </div>
            <div className="text-center">
              <a
                href="https://t.me/fanflux"
                target="_blank"
                rel="noreferrer"
                className="link"
              >
                Support
              </a>
            </div>
          </div>
        </ul>
      </div>
    </div>
  );
};
