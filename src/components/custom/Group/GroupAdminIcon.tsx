"use client";

import { UserRoundCogIcon } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "../../ui/tooltip";

interface GroupAdminIconProps {}

const GroupAdminIcon: React.FC<GroupAdminIconProps> = function () {
    return (
        <>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild className="cursor-default">
                        <span>
                            <UserRoundCogIcon className="h-[1.15rem] text-slate-300" />
                        </span>
                    </TooltipTrigger>

                    <TooltipContent>
                        <p className="text-[0.775rem]">Group admin</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </>
    );
};

export default GroupAdminIcon;
