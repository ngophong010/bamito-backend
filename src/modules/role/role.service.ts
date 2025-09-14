// ===============================================================
// --- MISC ---
// ===============================================================

export const getAllRoles = async () => {
    return prisma.role.findMany({
        select: { roleId: true, roleName: true },
        orderBy: { roleName: 'asc' }
    });
};