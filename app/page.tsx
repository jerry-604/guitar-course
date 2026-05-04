import { Hero } from "@/components/landing/Hero";
import { WatchThisFirst } from "@/components/landing/WatchThisFirst";
import { FeaturedSongs } from "@/components/landing/FeaturedSongs";
import { CurriculumPreview } from "@/components/curriculum/CurriculumPreview";
import { InstructorPitch } from "@/components/landing/InstructorPitch";
import { ChordTrio } from "@/components/landing/ChordTrio";
import { TeacherMarquee } from "@/components/landing/TeacherMarquee";
import { Footer } from "@/components/landing/Footer";
import { SectionDivider } from "@/components/ui/SectionDivider";

export default function Home() {
  return (
    <main>
      <Hero />
      <WatchThisFirst />
      <FeaturedSongs />
      <ChordTrio />
      <SectionDivider />
      <CurriculumPreview />
      <InstructorPitch />
      <TeacherMarquee />
      <Footer />
    </main>
  );
}
