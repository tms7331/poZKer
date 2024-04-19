import dynamic from "next/dynamic";

export default dynamic(() => import("./playgame-page"), {
  ssr: false,
});
