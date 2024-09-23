"use client";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import axios from "@/lib/config/axios.config";
import {
    updatePreferencesSchema,
    UpdatePreferencesSchema,
} from "@/lib/validationSchemas/update-preferences";
import { TUserPreferences } from "@/models/user_preferences.model";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { Loader2Icon, LogOutIcon } from "lucide-react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

interface SettingsProps {
    userPreferences: TUserPreferences | null;
}

const Settings: React.FC<SettingsProps> = function ({ userPreferences }) {
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const { toast } = useToast();
    const router = useRouter();
    const themeInputRef = useRef<HTMLInputElement | null>(null);
    const acceptFriendRequestsFromAnyoneRef = useRef<HTMLInputElement | null>(
        null
    );

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            const response = await signOut({
                redirect: false,
            });

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

    const {
        formState: { errors, isSubmitting },
        register,
        handleSubmit,
        setError,
        setValue,
    } = useForm<UpdatePreferencesSchema>({
        defaultValues: {
            acceptGroupInvitesFrom: userPreferences?.acceptGroupInvitesFrom,
            acceptFriendRequestsFromAnyone:
                userPreferences?.acceptFriendRequestsFromAnyone,
            theme: userPreferences?.theme,
        },
        resolver: zodResolver(updatePreferencesSchema),
    });

    const handleFormSubmission: SubmitHandler<UpdatePreferencesSchema> = async (
        data
    ) => {
        try {
            const response = await axios.patch("/api/v1/preferences", data);

            if (response.status !== 200) {
                toast({
                    title: response.data.error.cause ?? "Error",
                    description:
                        response.data.error.message ?? "Something went wrong",
                    variant: "destructive",
                });
            } else {
                toast({
                    title: "Success",
                    description: "Preferences updated successfully",
                    className: "bg-green-700 text-slate-100",
                });
            }
        } catch (error) {
            if (error instanceof AxiosError) {
                toast({
                    title: error.response?.data.error.cause ?? "Error",
                    description:
                        error.response?.data.error.message ??
                        "Something went wrong",
                });
            } else {
                toast({
                    title: "Error",
                    description: "Something went wrong",
                });
            }
        }
    };

    return (
        <>
            <section className="h-full w-full flex flex-col flex-nowrap gap-16">
                <div className="text-[2.15rem] font-semibold">Preferences</div>
                <form
                    onSubmit={handleSubmit(handleFormSubmission)}
                    className="flex flex-col flex-nowrap gap-10 pl-5"
                >
                    <section className="flex flex-col flex-nowrap gap-2.5">
                        <p className="font-semibold text-[1.2rem] mb-2.5">
                            Privacy :
                        </p>

                        <div className="pl-[1rem] flex flex-row flex-nowrap items-center gap-3.5">
                            <Switch
                                defaultChecked={
                                    !!userPreferences?.acceptFriendRequestsFromAnyone
                                }
                                onCheckedChange={(isChecked) =>
                                    setValue(
                                        "acceptFriendRequestsFromAnyone",
                                        isChecked
                                    )
                                }
                            />
                            <input
                                {...register("acceptFriendRequestsFromAnyone")}
                                type="checkbox"
                                className="h-0 w-0 hidden"
                            />
                            <p className="text-[.935rem]">
                                Receive friend requests from anyone
                            </p>
                        </div>

                        <div className="pl-[1rem] flex flex-col flex-nowrap justify-center w-fit gap-2">
                            <p className="text-[.935rem]">
                                Receive Group invites from
                            </p>

                            <select
                                {...register("acceptGroupInvitesFrom")}
                                className="w-fit rounded-md px-2.5 cursor-pointer py-1.5 bg-[#020817] border-[1px] border-slate-800 text-[#eee] text-[.85rem]"
                            >
                                <option value="ANYONE">Anyone</option>
                                <option value="FRIENDS">Friends</option>
                            </select>
                        </div>
                    </section>

                    <section className="flex flex-col flex-nowrap gap-2.5">
                        <p className="font-semibold text-[1.2rem] mb-2.5">
                            Optional :
                        </p>
                        <div className="pl-[1rem] flex flex-row flex-nowrap items-center gap-3">
                            <Switch
                                defaultChecked={
                                    userPreferences?.theme === "DARK"
                                }
                                onCheckedChange={(isChecked) =>
                                    setValue(
                                        "theme",
                                        isChecked ? "DARK" : "LIGHT"
                                    )
                                }
                            />
                            <input
                                {...register("theme")}
                                className="h-0 w-0 hidden"
                                type="checkbox"
                            />
                            <p className="text-[.935rem]">Dark Mode</p>
                        </div>
                    </section>

                    <Button
                        className="w-fit"
                        size="sm"
                        type="submit"
                        variant={"secondary"}
                    >
                        {isSubmitting && (
                            <Loader2Icon className="animate-spin h-4 mr-1 mb-px" />
                        )}
                        Update
                    </Button>
                </form>

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
                        <LogOutIcon className="ml-1 h-3.5" />
                    </Button>
                </div>
            </section>
        </>
    );
};

export default Settings;
