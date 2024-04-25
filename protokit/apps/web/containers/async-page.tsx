"use client";
/**
 * v0 by Vercel.
 * @see https://v0.dev/t/ctghixCOVBo
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
import Link from "next/link"

export default function Component() {
  return (
    <main className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
      <div className="max-w-md px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">poZKer</h1>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">Play Decentralized Poker on Mina</h1>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link
            className="rounded-md bg-indigo-500 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
            href="gettokens"
          >
            Get Started
          </Link>
          <Link className="text-sm font-semibold leading-6 text-gray-300 hover:text-gray-200" href="about">
            Learn more
            <span aria-hidden="true">→</span>
          </Link>

          <p>How to play:</p>
          <p>1. <Link className="text-sm font-semibold leading-6 text-gray-300 hover:text-gray-200" href="gettokens">Get Tokens</Link></p>
          <p>2. <Link className="text-sm font-semibold leading-6 text-gray-300 hover:text-gray-200" href="join">Join the game</Link> (and invite a friend to do the same)</p>
          <p>3. <Link className="text-sm font-semibold leading-6 text-gray-300 hover:text-gray-200" href="playgame">Play the Game</Link></p>

        </div>
      </div>
    </main>
  )
}
