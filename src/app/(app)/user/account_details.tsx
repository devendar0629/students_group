import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { type TUser } from "@/models/user.model";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Account_detailsProps {
    user: TUser & {
        _id: string;
    };
}

const Account_details: React.FC<Account_detailsProps> = function ({ user }) {
    return (
        <>
            <section className="w-full h-full">
                <div className="flex h-full flex-col flex-nowrap gap-6 w-[450px]">
                    <div>
                        <label className="text-[.95rem] text-[#ccc] inline-block mb-1 font-light pl-[1.5px]">
                            Username
                        </label>
                        <Input
                            disabled
                            className="rounded-md disabled:opacity-60 text-[#fff] text-[.9rem] pl-3.5 pr-2 py-5 bg-transparent border-[1.4px]"
                            value={user.name}
                            readOnly
                            type="text"
                        />
                    </div>
                    <div>
                        <label className="text-[.95rem] text-[#ccc] inline-block mb-1 font-light pl-[1.5px]">
                            Email
                        </label>
                        <Input
                            disabled
                            className="rounded-md disabled:opacity-60 text-[#fff] text-[.9rem] pl-3.5 pr-2 py-5 bg-transparent border-[1.4px]"
                            value={user.email}
                            readOnly
                            type="email"
                        />
                    </div>

                    <div className="mt-auto mb-20">
                        <p className="text-red-500 text-[1rem] mb-2">
                            Danger zone
                        </p>
                        <Separator
                            orientation="horizontal"
                            className="mt-2.5 mb-7"
                        />
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    className="mt-auto text-[.9rem]"
                                    variant="destructive"
                                >
                                    Delete my account
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>
                                        Are you absolutely sure?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will
                                        permanently delete your account and
                                        remove your data from our servers.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>
                                        Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction className="px-0 bg-transparent hover:bg-transparent">
                                        <Button
                                            className="px-5 ml-1"
                                            variant="destructive"
                                        >
                                            Delete
                                        </Button>
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>
            </section>
        </>
    );
};

export default Account_details;
