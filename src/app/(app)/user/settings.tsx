"use client";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { Loader2Icon } from "lucide-react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface SettingsProps {}

const Settings: React.FC<SettingsProps> = function () {
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            const response = await signOut({
                redirect: false,
            });

            console.log(response);

            if (!response.url) {
                toast({
                    title: "Error",
                    description: "Something went wrong",
                });
            }

            router.replace("/signin");
        } catch (error) {
            toast({
                title: "Error",
                description: "Something went wrong",
            });
        } finally {
            setIsLoggingOut(false);
        }
    };

    return (
        <>
            <section className="h-full w-full flex flex-col flex-nowrap">
                <div className="text-2xl font-semibold">Preferences</div>
                <div className="flex flex-col flex-nowrap gap-2.5">
                    <div className="flex flex-row flex-nowrap items-center gap-3 mt-10">
                        <Switch />
                        <p className="text-[.935rem]">Dark Mode</p>
                    </div>
                    <div className="flex flex-row flex-nowrap items-center gap-3">
                        <Switch />
                        <p className="text-[.935rem]">Receive product emails</p>
                    </div>
                </div>

                <div className="mt-auto mb-20">
                    <Button
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="mt-5"
                        variant="secondary"
                    >
                        {isLoggingOut && (
                            <Loader2Icon className="animate-spin mr-2 h-5 mb-px" />
                        )}
                        Logout
                    </Button>
                </div>
            </section>
        </>
    );
};

export default Settings;
