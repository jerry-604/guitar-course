import { Loader } from "@/components/ui/loader";

export default function Loading() {
  return (
    <main className="flex min-h-[50vh] items-center justify-center">
      <Loader size="lg" />
    </main>
  );
}
