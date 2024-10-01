"use client";

import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "../../ui/tooltip";

interface GroupCreatorIconProps {}

const GroupCreatorIcon: React.FC<GroupCreatorIconProps> = function () {
    return (
        <>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild className="cursor-default">
                        <span>
                            <svg
                                className="h-[1.2rem] text-slate-300"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 -960 960 960"
                                fill="#e8eaed"
                            >
                                <path d="M120-320v-80h320v80H120Zm0-160v-80h480v80H120Zm0-160v-80h480v80H120Zm534 440L512-342l56-56 86 84 170-170 56 58-226 226Z" />
                            </svg>
                        </span>
                    </TooltipTrigger>

                    <TooltipContent>
                        <p className="text-[0.775rem]">Group creator</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </>
    );
};

export default GroupCreatorIcon;
