import { Suspense } from "react";
import ResetPasswordForm from "./ResetPasswordForm";

// useSearchParams لازم يكون جوا Suspense (نفس فكرة صفحة تفاصيل الزبون)
export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={<div className="min-h-screen bg-[#060b16]" />}
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
