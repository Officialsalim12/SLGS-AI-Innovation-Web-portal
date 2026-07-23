import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <p className="text-8xl font-semibold text-white/10">404</p>
      <h1 className="mt-4 text-2xl font-semibold text-white">Page not found</h1>
      <p className="mt-2 text-white/50">
        This route drifted out of orbit. Head back to base.
      </p>
      <Link href="/" className="mt-8">
        <Button magnetic>Return home</Button>
      </Link>
    </div>
  );
}
