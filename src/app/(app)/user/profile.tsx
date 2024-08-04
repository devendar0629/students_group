"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import axios from "@/lib/config/axios.config";
import {
    UpdateProfileSchema,
    updateProfileSchema,
} from "@/lib/validationSchemas/update-profile";
import { type TUser } from "@/models/user.model";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { Calendar, Loader2Icon } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

interface ProfileProps {
    user: TUser & {
        _id: string;
    };
}

const Profile: React.FC<ProfileProps> = function ({ user }) {
    if (!user) {
        return (
            <>
                <p>Something went wrong, try again.</p>
            </>
        );
    }

    const formRef = useRef<HTMLFormElement>(null);

    const {
        register,
        setError,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<UpdateProfileSchema>({
        resolver: zodResolver(updateProfileSchema),
        defaultValues: {
            bio: user.bio,
            gender: user.gender!,
            name: user.name,
        },
    });

    const { toast } = useToast();
    const router = useRouter();

    const handleFormSubmit: SubmitHandler<UpdateProfileSchema> = async (
        data
    ) => {
        try {
            // create form data using the form element itself
            const formData = new FormData(formRef.current!);
            formData.append("bio", data.bio!);

            const resp = await axios.patch(`/api/v1/users`, formData);

            if (resp.status !== 200) {
                toast({
                    title: "Error",
                    description:
                        resp.data?.error?.message ??
                        "Something went wrong while updating details",
                    variant: "destructive",
                });
                return;
            }

            toast({
                title: "Updation successful",
                description: "Profile details updated successfully",
                className: "bg-green-700 text-slate-100",
            });

            setTimeout(() => router.refresh(), 1000);
        } catch (error) {
            if (error instanceof AxiosError) {
                toast({
                    title: "Error",
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
            <section className="h-full w-full">
                <ul>
                    {/* Profile update form */}

                    <form
                        ref={formRef}
                        onSubmit={handleSubmit(handleFormSubmit)}
                        className={`flex lg:w-[700px] w-[87%] flex-nowrap flex-col gap-4`}
                    >
                        {/* Avatar */}
                        <div className="flex flex-wrap mb-10 gap-10 items-center">
                            <Image
                                className="bg-green-400 inline-block border border-[#eee] rounded-[50%] lg:w-[200px] lg:h-[200px] h-[150px] w-[150px]"
                                width={200}
                                height={200}
                                src={user.avatar ?? ""}
                                alt="User profile photo"
                            />
                            <div>
                                <Input
                                    {...register("avatar")}
                                    className="file:bg-slate-800 file:text-[#eee] border-none file:cursor-pointer w-fit 
                                    file:rounded-sm file:px-3 file:py-1.5 lg:file:text-[.95rem] file:mr-2.5"
                                    type="file"
                                />
                                {errors.avatar && (
                                    <p className="text-red-500 pl-4 mt-1 text-[.9rem]">
                                        {errors.avatar.message as any}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Name */}
                        <div>
                            <label className="text-[1rem] text-[#ccc] inline-block mb-1 font-light pl-[1.5px]">
                                Name
                            </label>
                            <Input
                                placeholder="Your name"
                                className="pl-4 py-6 w-[550px]"
                                type="text"
                                {...register("name")}
                            />

                            {errors.name && (
                                <p className="text-red-500 ml-4 w-full text-[.875rem] font-light mt-2">
                                    {errors.name.message}
                                </p>
                            )}
                        </div>

                        {/* Bio */}
                        <div className="flex flex-col flex-nowrap">
                            <label className="text-[1rem] inline-block mb-1 text-[#ccc] font-light pl-[1.5px]">
                                Bio
                            </label>
                            <textarea
                                disabled={isSubmitting}
                                {...register("bio")}
                                placeholder="Something about you ..."
                                className="w-[550px] resize-none min-h-[100px] rounded-md border border-input bg-background px-3 pl-4 py-2 pt-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[1.5px] focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            ></textarea>
                            {errors.bio && (
                                <p className="text-red-500 text-[.875rem] font-light mt-1 pl-[2px]">
                                    {errors.bio.message}
                                </p>
                            )}
                        </div>

                        {/* Gender */}
                        <div className="w-[550px] mt-2">
                            <label className="text-[1rem] block mb-1 text-[#ccc] font-light pl-[1.5px]">
                                Gender
                            </label>
                            <select
                                className="rounded-md px-3 cursor-pointer py-2 bg-[#020817] border-[1px] border-slate-800 text-[#eee] text-[.925rem]"
                                {...register("gender")}
                            >
                                <option value="MALE">Male</option>
                                <option value="FEMALE">Female</option>
                                <option value="RATHER-NOT-SAY">
                                    Rather not say
                                </option>
                            </select>

                            {errors.gender && (
                                <p className="text-red-500 text-[.875rem] font-light mt-1 pl-[2px]">
                                    {errors.gender.message}
                                </p>
                            )}
                        </div>

                        {/* Date of birth */}
                        <div className="relative w-fit mt-4 flex flex-col flex-nowrap items-baseline">
                            <label className="text-[1rem] inline-block text-[#ccc] font-light pl-[1.5px] mb-1">
                                Date of birth
                            </label>

                            <div className="relative inline-block">
                                <input
                                    defaultValue={
                                        (user.dateOfBirth &&
                                            new Date(user.dateOfBirth!)
                                                ?.toISOString()
                                                ?.substring(0, 10)) ??
                                        ""
                                    }
                                    {...register("dateOfBirth")}
                                    placeholder="2021-01-01"
                                    className="rounded-md cursor-text bg-transparent px-2 pl-4 py-2 border-[1px] border-slate-800 text-[.9rem] text-[#eee] font-medium pr-3"
                                    type="date"
                                />
                                <Calendar className="absolute h-[20px] right-2.5 top-[calc(13px)]" />
                            </div>

                            {errors.dateOfBirth && (
                                <p className="text-red-500 text-[.875rem] font-light mt-1 pl-[2px]">
                                    {errors.dateOfBirth.message}
                                </p>
                            )}
                        </div>

                        <Button
                            className="text-[.95rem] mt-8 w-fit px-6 font-medium disabled:cursor-not-allowed"
                            variant={"secondary"}
                            disabled={isSubmitting}
                            type={"submit"}
                        >
                            {isSubmitting && (
                                <Loader2Icon className="animate-spin pl-0 mb-px h-[20px] mr-2" />
                            )}
                            Update
                        </Button>

                        {errors.root && (
                            <p className="text-red-500 text-[.875rem] font-light mt-1 pl-[2px]">
                                {errors.root.message}
                            </p>
                        )}
                    </form>
                </ul>
            </section>
        </>
    );
};

export default Profile;
