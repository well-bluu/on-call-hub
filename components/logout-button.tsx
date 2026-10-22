"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import LogoutModal from "@/components/logout-modal";

export function LogoutButton() {
  const router = useRouter();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();

    setIsModalOpen(false);
    router.push("/auth/login");
    router.refresh();
  };
  
  return (
    <>
      {/* Only opens the confirmation modal */}
      <Button onClick={() => setIsModalOpen(true)}>
        Logout
      </Button>
      
      {/* Confirmation Modal */}
      <LogoutModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={logout}
      />
    </>
  );
}
