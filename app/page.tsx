import { Hero } from "@/components/landing/Hero";
import { FeaturedSongs } from "@/components/landing/FeaturedSongs";
import { CurriculumPreview } from "@/components/curriculum/CurriculumPreview";
import { InstructorPitch } from "@/components/landing/InstructorPitch";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  return (
    <main>
      <Hero />
      <FeaturedSongs />
      <CurriculumPreview />
      <InstructorPitch />
      <Footer />
    </main>
  );
}
