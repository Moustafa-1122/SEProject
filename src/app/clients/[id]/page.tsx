import { Suspense } from "react";
import ClientDetailsContent from "./ClientDetailsContent";


export default function ClientDetailsPage() {
  return (
    <Suspense fallback={<p className="p-8">Loading...</p>}>
      <ClientDetailsContent />
    </Suspense>
  );
}