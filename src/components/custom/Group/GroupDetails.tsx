import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { PropsWithChildren } from "react";
import GroupCreatorIcon from "./GroupCreatorIcon";
import GroupAdminIcon from "./GroupAdminIcon";

interface GroupDetailsProps {
    groupDetails: any;
}
interface UserPreviewProps {
    userName: string;
    isAdmin: boolean;
    isCreator: boolean;
}

const UserPreview: React.FC<UserPreviewProps> = ({
    userName,
    isAdmin,
    isCreator,
}) => {
    return (
        <div className="text-sm pl-1.5 pr-2 items-center flex flex-row flex-nowrap gap-2 justify-between">
            <div className="line-clamp-1 grow text-ellipsis">~ {userName}</div>

            {isAdmin && <GroupAdminIcon />}

            {isCreator && <GroupCreatorIcon />}
        </div>
    );
};

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
                        <div className="text-sm">
                            <p className="text-muted-foreground">
                                Members ({groupDetails?.members.length})
                            </p>
                            <ScrollArea className="rounded-md max-h-[300px] border mt-[0.4rem] -ml-px">
                                <div className="px-2 py-3">
                                    {groupDetails?.members.map(
                                        (member: any, index: number) => (
                                            <div key={member._id}>
                                                <UserPreview
                                                    key={member._id}
                                                    userName={member.username}
                                                    isAdmin={member.isAdmin}
                                                    isCreator={member.isCreator}
                                                />
                                                {index + 1 <
                                                    groupDetails?.members
                                                        .length && (
                                                    <Separator className="my-2" />
                                                )}
                                            </div>
                                        )
                                    )}
                                </div>
                            </ScrollArea>
                        </div>
                    </div>
                </section>
            </PopoverContent>
        </Popover>
    );
};

export default GroupDetails;
