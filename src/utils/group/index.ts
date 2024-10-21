/**
 *
 * @param group Group object with admin field populated
 * @param userId User's object id string to check
 * @returns boolean
 */
export const isGroupAdmin = (group: any, userId?: string | null) => {
    if (!userId) {
        return false;
    }

    let groupAdminCount = group.admin.length;

    for (let i = 0; i < groupAdminCount; i++) {
        if (group.admin[i].userId.toString() === userId) {
            return true;
        }
    }

    return false;
};

/**
 *
 * @param group Group object with members field populated
 * @param userId User's object id string to check
 * @returns boolean
 */
export const isGroupMember = (group: any, userId?: string | null) => {
    if (!userId) {
        return false;
    }

    const groupMemberCount = group.members.length;

    for (let i = 0; i < groupMemberCount; i++) {
        if (group.members[i].userId.toString() === userId) {
            return true;
        }
    }

    return false;
};
