"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import LoadingScreen from "@/components/LoadingScreen";

interface ApplicationGuardProps {
  children: React.ReactNode;
  applicationType: "member" | "committee" | "ea";
  redirectPath?: string;
}

export default function ApplicationGuard({ 
  children, 
  applicationType, 
  redirectPath 
}: ApplicationGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [hasApplication, setHasApplication] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/");
      return;
    }

    setIsLoading(false);
  }, [session, status, router]);

  const checkApplication = useCallback(async () => {
    try {
      const response = await fetch("/api/applications/check-existing");
      if (response.ok) {
        const data = await response.json();
        
        let hasRequiredApplication = false;
        let defaultRedirectPath = "";

        switch (applicationType) {
          case "member":
            hasRequiredApplication = data.hasMemberApplication;
            defaultRedirectPath = "/user/apply/member";
            break;
          case "committee":
            hasRequiredApplication = data.hasCommitteeApplication;
            defaultRedirectPath = "/user/apply/committee-staff";
            break;
          case "ea":
            hasRequiredApplication = data.hasEAApplication;
            defaultRedirectPath = "/user/apply/executive-assistant";
            break;
        }

        if (!hasRequiredApplication) {
          // Redirect to appropriate application page
          const targetPath = redirectPath || defaultRedirectPath;
          router.push(targetPath);
          return;
        }

        setHasApplication(true);
      }
    } catch (error) {
      console.error("Error checking application:", error);
      // On error, redirect to user dashboard
      router.push("/user");
    } finally {
      setIsChecking(false);
    }
  }, [applicationType, redirectPath, router]);

  useEffect(() => {
    if (status === "authenticated" && !isLoading) {
      checkApplication();
    }
  }, [status, isLoading, checkApplication]);

  // Show loading screen while checking authentication or application
  if (isLoading || status === "loading" || isChecking) {
    return <LoadingScreen />;
  }

  // If no session, don't render anything (redirect will happen)
  if (!session) {
    return null;
  }

  // If no application found, don't render anything (redirect will happen)
  if (!hasApplication) {
    return null;
  }

  // Render the protected content
  return <>{children}</>;
}
