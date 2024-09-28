import { TGroup } from "@/models/group.model";

export const isGroupAdmin = (group: TGroup, userId?: string | null) => {
    if (!userId) {
        return false;
    }

    let groupAdminCount = group.admin.length;

    for (let i = 0; i < groupAdminCount; i++) {
        if (group.admin[i]._id.toString() === userId) {
            return true;
        }
    }

    return false;
};

export const isGroupMember = (group: TGroup, userId?: string | null) => {
    if (!userId) {
        return false;
    }

    const groupMemberCount = group.members.length;

    for (let i = 0; i < groupMemberCount; i++) {
        if (group.members[i]._id.toString() === userId) {
            return true;
        }
    }

    return false;
};
