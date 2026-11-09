import type { Metadata } from "next";
import { ConsultationForm } from "./consultation-form";

export const metadata: Metadata = {
  title: "Schedule a Free Consultation | Second Nature",
  description: "Choose a complimentary Google Meet with Second Nature to begin planning your gathering.",
};

export default function ConsultationPage() {
  return <ConsultationForm />;
}
