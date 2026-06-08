import type { NextPage } from "next";
import dynamic from "next/dynamic";
import { SeoHead } from "../../shared/components/SeoHead";

const Infomap = dynamic(() => import("../../features/infomap"), {
  ssr: false,
});

const OnlinePage: NextPage = () => {
  return (
    <>
      <SeoHead
        title="Infomap workbench — run community detection online"
        description="Run Infomap in your browser, inspect communities, and download flow-based community detection results without installing software."
        path="/infomap/workbench/"
      />
      <Infomap />
    </>
  );
};

(OnlinePage as NextPage & { fillViewport?: boolean }).fillViewport = true;

export default OnlinePage;
