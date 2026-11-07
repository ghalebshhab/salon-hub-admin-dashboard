"use client";

import { useParams } from "next/navigation";
import { PersonProfile } from "@/components/person-profile";

export default function PersonProfilePage() {
  const { id } = useParams<{ id: string }>();
  return <PersonProfile endpoint={`users/${id}`} backHref="/users" backLabel="Back to users" />;
}
