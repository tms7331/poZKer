import dynamic from "next/dynamic";

export default dynamic(() => import("./gettokens-page"), {
  ssr: false,
});
