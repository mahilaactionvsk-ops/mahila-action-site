import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./components/ui/dialog";
import { registerComingSoonModal } from "../lib/comingSoon";

// ── Shared "coming soon" modal ──────────────────────────────────────────────
// Mounted ONCE at the root of the app (see App.tsx). Any code, anywhere, can
// trigger it by calling `showComingSoonModal()` from src/lib/comingSoon.ts —
// no props or context wiring needed at each call site.
export function ComingSoonModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    registerComingSoonModal(() => setOpen(true));
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="bg-[#f4efe7] border-none max-w-[420px] text-center sm:text-center">
        <DialogHeader className="items-center text-center sm:text-center">
          <div className="text-[40px] leading-none mb-1">🚧</div>
          <DialogTitle
            className={`font-['Fraunces',serif] text-[#1e1e1e] text-[24px]`}
            style={{ fontVariationSettings: '"SOFT" 0, "WONK" 1' }}
          >
            We're upgrading our systems
          </DialogTitle>
          <DialogDescription
            className={`font-['Inter',sans-serif] text-[#1e1e1e]/70 text-[15px] leading-relaxed`}
          >
            This feature will be back soon. Thanks for sitting tight!
          </DialogDescription>
        </DialogHeader>
        <button
          onClick={() => setOpen(false)}
          className={`font-['Inter',sans-serif] w-full bg-[#a65a4a] text-[#f4efe7] text-[16px] font-semibold py-3.5 rounded-full mt-2 hover:bg-[#993925] transition-colors cursor-pointer`}
        >
          Got it
        </button>
      </DialogContent>
    </Dialog>
  );
}
