import { Marquee } from "@/components/ui/Marquee";

const ITEMS = [
  "JustinGuitar",
  "Good Guitarist",
  "Dad Rock Dojo",
  "Kevin Nickens",
  "The Cowboy Rides Away",
  "Amarillo by Morning",
  "George Strait",
  "D · G · C",
  "Ad-free · curated · free",
  "A country track",
];

export function TeacherMarquee() {
  return <Marquee items={ITEMS} className="border-y-0" />;
}
