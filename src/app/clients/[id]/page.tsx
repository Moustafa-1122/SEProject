import { Suspense } from "react";
import ClientDetailsContent, {
  ClientDetailsSkeleton,
} from "./ClientDetailsContent";

export default function ClientDetailsPage() {
  return (
    <Suspense fallback={<ClientDetailsSkeleton />}>
      <ClientDetailsContent />
    </Suspense>
  );
}
