"use client";

import { outfit } from "@/app/ui/fonts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import axios from "@/lib/config/axios.config";
import {
    type SignupSchema,
    signupSchema,
} from "@/lib/validationSchemas/signup";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { EyeIcon, EyeOffIcon, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

interface PageProps {}

const Signup: React.FC<PageProps> = function () {
    const {
        formState: { isSubmitting, errors },
        register,
        setError,
        handleSubmit,
    } = useForm<SignupSchema>({
        resolver: zodResolver(signupSchema),
    });

    const [passwordVisible, setPasswordVisible] = useState<boolean>(false);
    const { toast } = useToast();

    const handleSignup: SubmitHandler<SignupSchema> = async (formData) => {
        try {
            const response = await axios.post("/api/v1/auth/signup", {
                name: formData.name,
                username: formData.username,
                email: formData.email,
                password: formData.password,
            });

            if (response.status !== 201) {
                setError("root", {
                    message: response.data.error.message,
                });
            }

            toast({
                title: "Signed up successfully",
                className: "bg-green-700 text-slate-100",
            });
        } catch (error) {
            if (error instanceof AxiosError) {
                if (error.status! >= 400) {
                    toast({
                        title: "Error",
                        description: error.response?.data?.error?.message,
                        variant: "destructive",
                    });
                }
            } else
                toast({
                    title: "Something went wrong",
                    description: "Try again later",
                    variant: "destructive",
                });
        }
    };

    return (
        <>
            <main
                className={`${outfit.className} h-screen w-screen flex flex-col flex-nowrap justify-center items-center`}
            >
                <div className="lg:w-[555px] p-5 flex flex-col flex-nowrap tracking-wider">
                    <h2 className="text-center text-[2.5rem] font-semibold">
                        Signup to Students Group
                    </h2>

                    <form
                        className="flex mt-10 flex-col flex-nowrap gap-3.5"
                        onSubmit={handleSubmit(handleSignup)}
                    >
                        <div className="flex flex-col justify-center gap-1.5">
                            <label className="ml-px">Name</label>
                            <Input
                                type="text"
                                className="pl-4 py-[1.4rem] pb-[1.5rem] text-[1.05rem] focus:ring-1 focus:outline-gray-500 focus:ring-offset-2"
                                placeholder="Name"
                                {...register("name")}
                            />
                            {errors.name && (
                                <p className="text-red-500 text-center font-light mt-0.5 text-[.95rem]">
                                    {errors.name.message}
                                </p>
                            )}
                        </div>

                        <div className="flex flex-col justify-center gap-1.5">
                            <label className="ml-px">Username</label>
                            <Input
                                type="text"
                                className="pl-4 py-[1.4rem] pb-[1.5rem] text-[1.05rem] focus:ring-1 focus:outline-gray-500 focus:ring-offset-1"
                                placeholder="Username"
                                {...register("username")}
                            />
                            {errors.username && (
                                <p className="text-red-500 text-center font-light mt-0.5 text-[.95rem]">
                                    {errors.username.message}
                                </p>
                            )}
                        </div>

                        <div className="flex flex-col justify-center gap-1.5">
                            <label className="ml-px">Email</label>
                            <Input
                                type="text"
                                className="pl-4 py-[1.4rem] pb-[1.5rem] text-[1.05rem] focus:ring-1 focus:outline-gray-500 focus:ring-offset-1"
                                placeholder="example@mail.com"
                                {...register("email")}
                            />
                            {errors.email && (
                                <p className="text-red-500 text-center font-light mt-0.5 text-[.95rem]">
                                    {errors.email.message}
                                </p>
                            )}
                        </div>

                        <div className="flex flex-col justify-center gap-1.5">
                            <div className="grow relative">
                                <label className="ml-px">Password</label>
                                <Input
                                    {...register("password")}
                                    type={passwordVisible ? "text" : "password"}
                                    className="mt-[0.375rem] pl-4 py-[1.4rem] pb-[1.5rem] text-[1.05rem] focus:ring-1 focus:outline-gray-500 focus:ring-offset-1"
                                    placeholder="Password"
                                />

                                <span
                                    tabIndex={0}
                                    onClick={() =>
                                        setPasswordVisible((prev) => !prev)
                                    }
                                    className="absolute cursor-pointer top-[54%] right-3"
                                >
                                    {passwordVisible ? (
                                        <EyeIcon />
                                    ) : (
                                        <EyeOffIcon />
                                    )}
                                </span>
                            </div>
                            {errors.password && (
                                <p className="text-red-500 text-center font-light mt-0.5 text-[.95rem]">
                                    {errors.password.message}
                                </p>
                            )}
                        </div>

                        <Button
                            className="flex select-none py-[1.4rem] pb-[1.5rem] text-[1.15rem] flex-row mt-4 flex-nowrap justify-center lg:gap-2.5 gap-2 items-center"
                            disabled={isSubmitting}
                            variant={"secondary"}
                        >
                            {isSubmitting && (
                                <LoaderCircle className="animate-spin h-[1.35rem]" />
                            )}
                            Signup
                        </Button>
                        {errors.root && (
                            <p className="text-red-500 text-center font-light mt-0.5 text-[.95rem]">
                                {errors.root.message}
                            </p>
                        )}
                    </form>

                    <p className="mt-4 text-[1.075rem]">
                        Already a member ? &nbsp;
                        <Link
                            className="hover:underline text-blue-500 decoration-2 decoration-blue-500 underline-offset-[5.5px]"
                            href={"/signin"}
                        >
                            Signin
                        </Link>
                    </p>
                </div>
            </main>
        </>
    );
};

export default Signup;
