import dynamic from "next/dynamic";

export default dynamic(() => import("./join-page"), {
  ssr: false,
});
