import { ClusterSection } from "@/components/ClusterSection";
import { CosmicBackdrop } from "@/components/cosmic/CosmicBackdrop";
import { ThemeToggle } from "@/components/ThemeToggle";

function App() {
  return (
    <>
      <CosmicBackdrop />
      <ThemeToggle />
      <main className="relative z-10">
        <ClusterSection />
      </main>
    </>
  );
}

export default App;
