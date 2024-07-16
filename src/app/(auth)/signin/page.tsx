"use client";

import { outfit } from "@/app/ui/fonts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { signIn } from "next-auth/react";
import {
    type SigninSchema,
    signinSchema,
} from "@/lib/validationSchemas/signin";
import { zodResolver } from "@hookform/resolvers/zod";
import { EyeIcon, EyeOffIcon, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

interface PageProps {}

const Signin: React.FC<PageProps> = function () {
    const {
        formState: { isSubmitting, errors },
        register,
        setError,
        handleSubmit,
    } = useForm<SigninSchema>({
        resolver: zodResolver(signinSchema),
    });

    const [passwordVisible, setPasswordVisible] = useState<boolean>(false);
    const { toast } = useToast();
    const router = useRouter();

    const handleSignin: SubmitHandler<SigninSchema> = async (formData) => {
        try {
            const response = await signIn("credentials", {
                username_or_email: formData.username_or_email,
                password: formData.password,
                redirect: false,
            });

            if (response?.ok) {
                const successToast = toast({
                    title: "Signin success",
                    description: "Redirecting to home page ...",
                    className: "bg-green-700 text-slate-100",
                });

                setTimeout(() => {
                    successToast.dismiss();
                    router.replace("/");
                }, 750);
            } else {
                toast({
                    title: "Error",
                    description: response?.error,
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: "Error signing in",
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
                        Signin to Students Group
                    </h2>

                    <form
                        className="flex mt-14 flex-col flex-nowrap gap-3.5"
                        onSubmit={handleSubmit(handleSignin)}
                    >
                        <div className="flex flex-col justify-center gap-1.5">
                            <label className="ml-px">Username or Email</label>
                            <Input
                                type="text"
                                className="pl-4 py-[1.4rem] pb-[1.5rem] text-[1.05rem] focus:ring-1 focus:outline-gray-500 focus:ring-offset-2"
                                placeholder="Username or Email"
                                {...register("username_or_email")}
                            />
                            {errors.username_or_email && (
                                <p className="text-red-500 text-center font-light mt-0.5 text-[.95rem]">
                                    {errors.username_or_email.message}
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
                            className="flex select-none py-[1.4rem] pb-[1.5rem] text-[1.15rem] flex-row mt-6 flex-nowrap justify-center lg:gap-2.5 gap-2 items-center disabled:cursor-not-allowed"
                            disabled={isSubmitting}
                            variant={"secondary"}
                        >
                            {isSubmitting && (
                                <LoaderCircle className="animate-spin h-[1.35rem]" />
                            )}
                            Signin
                        </Button>
                        {errors.root && (
                            <p className="text-red-500 text-center font-light mt-0.5 text-[.95rem]">
                                {errors.root.message}
                            </p>
                        )}
                    </form>

                    <p className="mt-4 text-[1.075rem]">
                        Not a member ? &nbsp;
                        <Link
                            className="hover:underline text-blue-500 decoration-2 decoration-blue-500 underline-offset-[5.5px]"
                            href={"/signup"}
                        >
                            Signup
                        </Link>
                    </p>
                </div>
            </main>
        </>
    );
};

export default Signin;
