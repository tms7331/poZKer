"use client";

import { Button } from "@/components/ui/button";
import protokit from "@/public/protokit-zinc.svg";
import Image from "next/image";
import Link from "next/link";
// @ts-ignore
import truncateMiddle from "truncate-middle";
import { Skeleton } from "@/components/ui/skeleton";
import { Chain } from "./chain";
import { Separator } from "./ui/separator";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import HeaderLinks from "./header-links";

export interface HeaderProps {
  loading: boolean;
  wallet?: string;
  onConnectWallet: () => void;
  balance?: string;
  balanceLoading: boolean;
  blockHeight?: string;
}

export default function Header({
  loading,
  wallet,
  onConnectWallet,
  balance,
  balanceLoading,
  blockHeight,
}: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`flex items-center justify-between bg-[#111] shadow-lg`}>
      <div
        className={`absolute inset-x-0  left-0 top-[56px] z-50 flex flex-col gap-4 px-4 pb-6 pt-4 shadow-lg transition-all ${
          isOpen ? "" : "hidden"
        } h-fit  text-white`}
      >
        <HeaderLinks />
      </div>
      <div className="flex w-full justify-between px-2 sm:container">
        <button className="block sm:hidden" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? (
            <X color="white" className="transition-all" />
          ) : (
            <Menu color="white" className="transition-all" />
          )}
        </button>
        <div className="hidden basis-6/12 items-center justify-start gap-6 text-white sm:flex">
          <HeaderLinks />
        </div>

        <div className="flex w-full basis-6/12 flex-row items-center justify-end sm:w-auto">
          {/* balance */}
          {wallet && (
            <div className="mr-4 flex shrink flex-col items-end justify-center">
              <div>
                <p className="text-xs">Your balance</p>
              </div>
              <div className="w-32 pt-0.5 text-right">
                {balanceLoading && balance === undefined ? (
                  <Skeleton className="h-4 w-full" />
                ) : (
                  <p className="text-xs font-bold">{balance} PZKR</p>
                )}
              </div>
            </div>
          )}
          {/* connect wallet */}
          <Button
            loading={loading}
            className="shadow-bright mt-4 w-fit border border-gray-400 bg-transparent px-2 sm:w-44 sm:px-0"
            onClick={onConnectWallet}
          >
            <div>
              {wallet ? truncateMiddle(wallet, 7, 7, "...") : "Connect wallet"}
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
}
