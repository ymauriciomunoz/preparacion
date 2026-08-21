"use client";

import { CourseCheckout } from "./CourseCheckout";

export function PaymentPage() {
  return (
    <CourseCheckout
      recommendedTrack={null}
      onBack={() => window.location.assign("/")}
      onContinue={(mode, track) => window.location.assign(`/curso?mode=${mode}&track=${track}`)}
    />
  );
}
