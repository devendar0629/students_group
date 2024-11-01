"use client";

import { Separator } from "@/components/ui/separator";
import GroupPreview from "./GroupPreview";
import { nunito } from "@/app/ui/fonts";
import { Loader2Icon } from "lucide-react";
import Link from "next/link";

interface GroupsPreviewProps {
    groups: any;
    isFetching: boolean;
    onSelectedGroupChange: React.Dispatch<React.SetStateAction<any>>;
}

const GroupsPreview: React.FC<GroupsPreviewProps> = function ({
    groups,
    onSelectedGroupChange,
    isFetching,
}) {
    if (isFetching) {
        return (
            <section className="w-full h-full flex justify-center items-center">
                <p className="text-lg flex justify-center items-center gap-2">
                    <Loader2Icon className="animate-spin size-5" /> Loading
                </p>
            </section>
        );
    }

    if (groups?.length === 0) {
        return (
            <>
                <section className="h-full w-full rounded-sm bg-gray-900">
                    <div
                        className={`flex flex-row flex-nowrap items-center text-[1.85rem] w-full justify-between pt-3 pb-3.5 ${nunito.className}`}
                    >
                        <span className="pl-3.5 font-semibold">Groups</span>

                        <Link
                            href="/groups/new"
                            className="flex flex-col flex-nowrap items-center justify-center rounded-[50%] h-[2.15rem] w-[2.15rem] text-center mr-2 bg-transparent hover:bg-slate-500 cursor-pointer"
                        >
                            +
                        </Link>
                    </div>

                    <p className="pl-3.5">No groups created yet</p>
                </section>
            </>
        );
    }

    const handleGroupChange = (e: any) => {
        if (e.target.parentNode?.classList.contains("group-preview-unit")) {
            onSelectedGroupChange(e.target.parentNode);
        }
    };

    return (
        <>
            <section className="h-full w-full rounded-sm bg-gray-900">
                <div
                    className={`flex flex-row flex-nowrap items-center text-[1.85rem] w-full justify-between pt-3 pb-3.5 ${nunito.className}`}
                >
                    <span className="pl-3.5 font-semibold">Groups</span>

                    <Link
                        href="/groups/new"
                        className="flex flex-col flex-nowrap items-center justify-center rounded-[50%] h-[2.15rem] w-[2.15rem] text-center mr-2 bg-transparent hover:bg-slate-500 cursor-pointer"
                    >
                        +
                    </Link>
                </div>
                <Separator orientation="horizontal" className="mb-3.5" />

                <div className="w-full" onClick={handleGroupChange}>
                    {groups?.map((groupObj: any, currGroupNumber: any) => {
                        return (
                            <div key={groupObj._id}>
                                <GroupPreview
                                    className={`cursor-pointer group-preview-unit gp-no-${currGroupNumber}`}
                                    key={groupObj._id}
                                    group={groupObj}
                                />
                                {currGroupNumber < groups.length - 1 && (
                                    <Separator
                                        key={currGroupNumber}
                                        orientation="horizontal"
                                        className="bg-black"
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>
            </section>
        </>
    );
};

export default GroupsPreview;
