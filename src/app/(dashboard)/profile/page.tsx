import { PersonProfile } from "@/components/person-profile";

export default function AdminProfilePage() {
  return <PersonProfile endpoint="profile" backHref="/" backLabel="Back to overview" adminProfile />;
}
