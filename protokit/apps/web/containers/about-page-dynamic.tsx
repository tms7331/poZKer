import dynamic from "next/dynamic";

export default dynamic(() => import("./about-page"), {
  ssr: false,
});
