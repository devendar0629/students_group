import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { UserRoundCogIcon } from "lucide-react";
import { PropsWithChildren } from "react";

interface GroupDetailsProps {
    groupDetails: any;
}

const GroupDetails: React.FC<PropsWithChildren & GroupDetailsProps> = ({
    children,
    groupDetails,
}) => {
    return (
        <Popover>
            <PopoverTrigger asChild>{children}</PopoverTrigger>

            <PopoverContent className="lg:max-w-screen-sm grid gap-y-3.5 rounded-2xl p-[1.15rem] border-slate-600">
                <section className="flex flex-col flex-nowrap pl-4 gap-2.5">
                    <h3 className="text-[1.275rem] font-medium leading-none">
                        {groupDetails?.name}
                    </h3>

                    <p className="text-[0.775rem] max-h-[70px] overflow-hidden text-muted-foreground font-medium line-clamp-4">
                        {groupDetails?.description}
                    </p>
                </section>

                <section className="flex flex-col flex-nowrap gap-1">
                    <p className="text-sm">
                        <span className="text-muted-foreground">
                            Created on:
                        </span>{" "}
                        {groupDetails?.createdAt
                            ?.substring(0, 16)
                            .replace("T", " ")}
                    </p>

                    <p className="text-sm">
                        <span className="text-muted-foreground">
                            Created by:
                        </span>{" "}
                        ~ {groupDetails?.createdBy?.username}
                    </p>

                    <div className="mt-3">
                        <p className="text-sm">
                            <p className="text-muted-foreground">
                                Members ({groupDetails?.members.length})
                            </p>
                            <ScrollArea className="rounded-md max-h-[300px] border mt-[0.4rem] -ml-px">
                                <div className="px-2 py-3">
                                    {groupDetails?.members.map(
                                        (member: any, index: number) => (
                                            <>
                                                <div className="text-sm pl-1.5 pr-2 items-center flex flex-row flex-nowrap gap-2 justify-between">
                                                    <div
                                                        key={member._id}
                                                        className="line-clamp-1 grow text-ellipsis"
                                                    >
                                                        ~ {member.username}
                                                    </div>

                                                    {groupDetails?.createdBy
                                                        ._id === member._id && (
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger
                                                                    asChild
                                                                    className="cursor-default"
                                                                >
                                                                    <span>
                                                                        <UserRoundCogIcon className="h-[1.15rem] text-slate-300" />
                                                                    </span>
                                                                </TooltipTrigger>

                                                                <TooltipContent>
                                                                    <p className="text-[0.775rem]">
                                                                        Group
                                                                        admin
                                                                    </p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    )}
                                                </div>
                                                {index + 1 <
                                                    groupDetails?.members
                                                        .length && (
                                                    <Separator className="my-2" />
                                                )}
                                            </>
                                        )
                                    )}
                                </div>
                            </ScrollArea>
                        </p>
                    </div>
                </section>
            </PopoverContent>
        </Popover>
    );
};

export default GroupDetails;
