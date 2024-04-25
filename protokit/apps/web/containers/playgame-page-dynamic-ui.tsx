import dynamic from "next/dynamic";

export default dynamic(() => import("./playgame-page-ui"), {
  ssr: false,
});
