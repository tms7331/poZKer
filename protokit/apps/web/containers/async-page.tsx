"use client";
import { ArrowRight } from "lucide-react";
/**
 * v0 by Vercel.
 * @see https://v0.dev/t/ctghixCOVBo
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
import Link from "next/link";

export default function Component() {
  return (
    <main className="flex h-[calc(100dvh-56px)] bg-[#111] pt-20 text-white">
      <div className="mx-auto max-w-[800px] px-4 text-center sm:px-6 lg:px-8">
        <h1 className="bg-gradient-to-br from-red-500 to-amber-200 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl lg:text-6xl">
          poZKer
        </h1>
        <h1 className="pt-2.5 text-2xl font-medium tracking-tight sm:text-3xl lg:text-4xl">
          Play Decentralized ZK Poker on Mina
        </h1>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link
            className="rounded-md bg-indigo-500 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
            href="gettokens"
          >
            Get Started
          </Link>
          <Link
            className="flex gap-1 text-sm font-semibold leading-6  text-gray-300 hover:text-gray-200"
            href="about"
          >
            Learn more
            <ArrowRight className="my-auto size-3.5" />
          </Link>
        </div>
        <div className="mt-20">
          {" "}
          <p>How to play:</p>
          <p>
            1.{" "}
            <Link
              className="text-sm font-semibold leading-6 text-gray-300 hover:text-gray-200"
              href="https://www.aurowallet.com/"
            >
              Install the Auro wallet
            </Link>
          </p>
          <p>
            2.{" "}
            <Link
              className="text-sm font-semibold leading-6 text-gray-300 hover:text-gray-200"
              href="gettokens"
            >
              Get Tokens
            </Link>
          </p>
          <p>
            3.{" "}
            <Link
              className="text-sm font-semibold leading-6 text-gray-300 hover:text-gray-200"
              href="join"
            >
              Join the game
            </Link>{" "}
            (and invite a friend to do the same)
          </p>
          <p>
            4.{" "}
            <Link
              className="text-sm font-semibold leading-6 text-gray-300 hover:text-gray-200"
              href="playgame"
            >
              Play ZK poker!
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
