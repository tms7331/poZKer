import '@/styles/globals.css'
import type { AppProps } from 'next/app'

import './reactCOIServiceWorker';

import GlobalContextProvider from './global-context';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <GlobalContextProvider>
      <Component {...pageProps} />
    </GlobalContextProvider>
  );
}
