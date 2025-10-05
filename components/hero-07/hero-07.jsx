"use client";
import AnimatedGridPattern from "@/components/ui/animated-grid-pattern";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowUpRight, CirclePlay } from "lucide-react";
import { signOut } from "next-auth/react";
import LoginPopup from "@/components/global/LoginPopup";
import { useAuth } from "@/providers/AuthContext";
import { useState } from "react";
import { useRouter } from 'nextjs-toploader/app';
import { toast } from "sonner"

const Hero07 = () => {
  const { user }= useAuth();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const router = useRouter();
  const handleButtonClick = () => {
    if (user) {
      router.push("/project/create-project"); // redirect without refresh
    } else {
      setIsLoginOpen(true); // open login popup
    }
  };
  return (
    <>
      <div className="relative min-h-screen flex items-center justify-center px-2 overflow-hidden">
        <AnimatedGridPattern
          numSquares={30}
          maxOpacity={0.2}
          duration={1}
          repeatdelay={1}
          className={cn(
            "[mask-image:radial-gradient(500px_circle_at_center,white,transparent)]",
            "inset-x-0 h-full skew-y-12"
          )}
        />
        <div className="relative z-10 text-center max-w-2xl">
          <Badge className="bg-gradient-to-br via-70% from-primary  to-primary rounded-full py-1 border-none">
            Just released v1.0.0
          </Badge>

          <h1 className="mt-6 text-4xl sm:text-5xl md:text-6xl font-bold !leading-[1.2] tracking-tight">
            Build Databases & Dashboards — <br /> In Minutes, Not Weeks
          </h1>

          <p className="mt-6 text-[17px] md:text-lg">
            GoRapidBase lets you create databases, auto-generated dashboards, and
            REST APIs — all without writing code. From schema design to data
            visualization, everything is instant, intuitive, and built for
            teams.
          </p>

          <div className="mt-12 flex items-center justify-center gap-4">
            <Button size="lg" className="text-base" onClick={handleButtonClick}>
              {user ? "Dashboard" : "Get Started"}
              <ArrowUpRight className="!h-5 !w-5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => toast.info("Coming soon!")}
              className=" text-base shadow-none"
            >
              <CirclePlay className="!h-5 !w-5" /> Watch Demo
            </Button>
          </div>
        </div>
      </div>
      <LoginPopup open={isLoginOpen} onOpenChange={setIsLoginOpen} />
    </>
  );
};

export default Hero07;
