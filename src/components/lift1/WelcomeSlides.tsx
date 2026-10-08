import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const KEY = "lift1-welcome-seen";

const SLIDES = [
  {
    title: "One shilling at a time",
    body: "Every member gives what they can — even KSh 1. Together, small amounts become real help.",
  },
  {
    title: "Help goes to real need",
    body: "Members ask for a lift when life gets hard. Each request is reviewed on need — never by luck, draws or winners.",
  },
  {
    title: "Every shilling is visible",
    body: "The community fund is kept separate and its numbers are public on the Transparency page.",
  },
];

export function WelcomeSlides() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!localStorage.getItem(KEY)) setOpen(true);
  }, []);

  function finish() {
    localStorage.setItem(KEY, "1");
    setOpen(false);
  }

  if (!open) return null;
  const slide = SLIDES[step] ?? SLIDES[0]!;
  const last = step === SLIDES.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 p-4 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-md rounded-3xl bg-background p-6 shadow-lift">
        <div className="flex aspect-[16/9] items-center justify-center rounded-3xl bg-primary text-primary-foreground">
          <span className="font-display text-5xl font-extrabold">{step + 1}</span>
        </div>
        <h2 className="mt-5 text-2xl font-extrabold text-primary">{slide.title}</h2>
        <p className="mt-2 text-muted-foreground">{slide.body}</p>
        <div className="mt-5 flex items-center justify-center gap-1.5">
          {SLIDES.map((_, i) => (
            <span
              key={i}
              className={`h-2 rounded-full transition-all ${i === step ? "w-6 bg-primary" : "w-2 bg-border"}`}
            />
          ))}
        </div>
        <div className="mt-5 flex gap-2">
          <Button variant="ghost" className="flex-1" onClick={finish}>
            Skip
          </Button>
          <Button className="flex-1" onClick={() => (last ? finish() : setStep(step + 1))}>
            {last ? "Get started" : "Next"}
          </Button>
        </div>
      </div>
    </div>
  );
}
