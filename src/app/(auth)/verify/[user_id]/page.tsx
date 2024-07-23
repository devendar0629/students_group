"use client";

import { Params } from "next/dist/shared/lib/router/utils/route-matcher";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { useParams } from "next/navigation";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp";
import { outfit } from "@/app/ui/fonts";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import axios from "@/lib/config/axios.config";
import { AxiosError } from "axios";
import { Loader2, UserCheckIcon } from "lucide-react";

interface PageProps {}

const Verify: React.FC<PageProps> = function () {
    const params = useParams<{ user_id: string } & Params>();
    const OTPRef = useRef<HTMLInputElement>(null);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const { toast } = useToast();

    const handleSubmit = async () => {
        if (OTPRef.current?.value.length != 6) return;

        try {
            setIsSubmitting(true);
            const response = await axios.post("/api/v1/auth/verify-email", {
                user_id: params.user_id,
                verificationCode: OTPRef.current.value,
            });

            if (!response.data.success) {
                toast({
                    title: "Error",
                    description: response?.data?.error?.message,
                    variant: "destructive",
                });
            } else
                toast({
                    title: "Success",
                    description: "Email verified successfully",
                    className: "bg-green-700 text-slate-100",
                });

            setIsSubmitting(false);
        } catch (error) {
            setIsSubmitting(false);

            if (error instanceof AxiosError && error.response!?.status >= 400) {
                toast({
                    title: "Error",
                    description: error.response?.data?.error?.message,
                    variant: "destructive",
                });
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
                className={`flex h-screen w-screen justify-center items-center flex-nowrap ${outfit.className}`}
            >
                <div className="flex flex-col justify-center items-center gap-8 mb-[325px] p-2">
                    <h2 className="text-[3.5rem] mb-2 font-semibold">
                        Verify your email
                    </h2>
                    <p className="text-xl">
                        Enter the verification code sent to your email
                    </p>

                    <div className="flex flex-row flex-nowrap gap-5">
                        <InputOTP
                            ref={OTPRef}
                            maxLength={6}
                            pattern={REGEXP_ONLY_DIGITS}
                        >
                            <InputOTPGroup>
                                <InputOTPSlot index={0} />
                                <InputOTPSlot index={1} />
                                <InputOTPSlot index={2} />
                                <InputOTPSlot index={3} />
                                <InputOTPSlot index={4} />
                                <InputOTPSlot index={5} />
                            </InputOTPGroup>
                        </InputOTP>

                        <Button
                            className="px-5 py-3 pb-[0.775rem] text-[1.05rem] disabled:cursor-not-allowed"
                            variant="secondary"
                            disabled={isSubmitting}
                            onClick={handleSubmit}
                        >
                            {isSubmitting && (
                                <Loader2 className="animate-spin mr-1.5 h-[1.25rem]" />
                            )}
                            Verify
                        </Button>
                    </div>
                </div>
            </main>
        </>
    );
};

export default Verify;
