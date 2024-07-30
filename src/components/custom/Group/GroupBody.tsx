"use client";

import { type TGroup } from "@/models/group.model";

interface GroupProps {
    group: TGroup | undefined | null;
}

const GroupBody: React.FC<GroupProps> = function ({ group }) {
    // if (!group) {
    //     return <></>;
    // }

    return (
        <>
            <div>GroupBody component</div>
        </>
    );
};

export default GroupBody;
