import { useEffect } from "react";
import { useApp, type Role } from "@/context/AppContext";
import { useAuth } from "@/hooks/useAuth";

/** Synchronise le rôle Firestore vers AppContext (dispatch écrans par rôle). */
export function ProfileRoleSync() {
  const { userProfile } = useAuth();
  const { setRole } = useApp();

  useEffect(() => {
    const r = userProfile?.role;
    if (r === "investor" || r === "farmer" || r === "merchant" || r === "agent") {
      setRole(r as Role);
    }
  }, [userProfile?.role, setRole]);

  return null;
}
