import { ReactNode } from "react";
import MainLogo from "@/app/ui/logo";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <main className="flex items-center justify-center md:h-screen">
      <div className="flex w-full items-center md:h-screen">
        <div className="min-w-[50%] text-white md:w-36 bg-blue-500 h-full flex items-center justify-center">
          <MainLogo />
        </div>
        <div className="min-w-[50%] px-4">{children}</div>
      </div>
    </main>
  );
}
