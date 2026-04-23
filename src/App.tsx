import { ClusterSection } from "@/components/ClusterSection";
import { CosmicBackdrop } from "@/components/cosmic/CosmicBackdrop";

function App() {
  return (
    <>
      <CosmicBackdrop />
      <main className="relative z-10">
        <ClusterSection />
      </main>
    </>
  );
}

export default App;
