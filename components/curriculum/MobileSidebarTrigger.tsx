"use client";

import * as React from "react";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";

/**
 * Hamburger trigger that opens the curriculum sidebar in a sheet on mobile.
 * Auto-closes on route change so tapping a lesson takes you there cleanly.
 */
export function MobileSidebarTrigger({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();

  // Close on navigation
  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label="Open course sidebar"
          className="fixed left-3 top-[4.5rem] z-30 grid h-10 w-10 place-items-center border border-foreground/15 bg-background text-foreground shadow-sm md:hidden"
        >
          <Menu className="h-4 w-4" />
        </button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-[18rem] max-w-[80vw] border-r border-border/60 bg-card p-0"
      >
        <SheetTitle className="sr-only">Course curriculum</SheetTitle>
        {children}
      </SheetContent>
    </Sheet>
  );
}
