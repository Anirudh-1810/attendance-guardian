const prisma = require('../prisma');
const AppError = require('../utils/AppError');
const { generateInviteCode, hashInviteCode } = require('../utils/generateInviteCode');

class InviteService {
    /**
     * Generate a single invite code.
     * @param {string} adminId - The admin user's ID
     * @param {Date|null} expiresAt - Optional expiry date
     * @returns {{ code: string, invite: object }} Plain code (shown once) + DB record
     */
    async generateInvite(adminId, expiresAt = null) {
        const code = generateInviteCode();
        const codeHash = hashInviteCode(code);

        const invite = await prisma.inviteCode.create({
            data: {
                codeHash,
                createdById: adminId,
                expiresAt: expiresAt ? new Date(expiresAt) : null,
            },
        });

        // Return plain code to show admin ONCE — it's never stored
        return { code, invite };
    }

    /**
     * Generate multiple invite codes in bulk.
     * @param {string} adminId - The admin user's ID
     * @param {number} count - Number of codes to generate (max 50)
     * @param {Date|null} expiresAt - Optional expiry date
     * @returns {{ codes: string[], invites: object[] }}
     */
    async generateBulkInvites(adminId, count, expiresAt = null) {
        if (!count || count < 1) {
            throw new AppError('Count must be at least 1', 400);
        }
        if (count > 50) {
            throw new AppError('Maximum 50 invite codes per request', 400);
        }

        const results = [];
        const codes = [];

        for (let i = 0; i < count; i++) {
            const code = generateInviteCode();
            const codeHash = hashInviteCode(code);
            codes.push(code);
            results.push({
                codeHash,
                createdById: adminId,
                expiresAt: expiresAt ? new Date(expiresAt) : null,
            });
        }

        // Use createMany for efficiency
        await prisma.inviteCode.createMany({ data: results });

        // Fetch the created invites to return them
        const invites = await prisma.inviteCode.findMany({
            where: {
                createdById: adminId,
                codeHash: { in: results.map((r) => r.codeHash) },
            },
            orderBy: { createdAt: 'desc' },
        });

        return { codes, invites };
    }

    /**
     * List all invites created by an admin.
     * @param {string} adminId
     * @returns {object[]}
     */
    async listInvites(adminId) {
        return prisma.inviteCode.findMany({
            where: { createdById: adminId },
            select: {
                id: true,
                codeHash: true,
                used: true,
                revoked: true,
                expiresAt: true,
                redeemedAt: true,
                createdAt: true,
                redeemedBy: {
                    select: { id: true, name: true, email: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    /**
     * Revoke an unused invite code (soft disable).
     * @param {string} adminId
     * @param {string} inviteId
     */
    async revokeInvite(adminId, inviteId) {
        const invite = await prisma.inviteCode.findFirst({
            where: { id: inviteId, createdById: adminId },
        });

        if (!invite) {
            throw new AppError('Invite code not found', 404);
        }
        if (invite.used) {
            throw new AppError('Cannot revoke a used invite code', 400);
        }
        if (invite.revoked) {
            throw new AppError('Invite code is already revoked', 400);
        }

        return prisma.inviteCode.update({
            where: { id: inviteId },
            data: { revoked: true },
        });
    }

    /**
     * Hard-delete an unused invite code.
     * @param {string} adminId
     * @param {string} inviteId
     */
    async deleteInvite(adminId, inviteId) {
        const invite = await prisma.inviteCode.findFirst({
            where: { id: inviteId, createdById: adminId },
        });

        if (!invite) {
            throw new AppError('Invite code not found', 404);
        }
        if (invite.used) {
            throw new AppError('Cannot delete a used invite code', 400);
        }

        return prisma.inviteCode.delete({ where: { id: inviteId } });
    }

    /**
     * Get invite usage statistics for an admin.
     * @param {string} adminId
     * @returns {{ total, used, unused, expired, revoked }}
     */
    async getStats(adminId) {
        const now = new Date();

        const [total, used, revoked, expired] = await Promise.all([
            prisma.inviteCode.count({ where: { createdById: adminId } }),
            prisma.inviteCode.count({ where: { createdById: adminId, used: true } }),
            prisma.inviteCode.count({ where: { createdById: adminId, revoked: true } }),
            prisma.inviteCode.count({
                where: {
                    createdById: adminId,
                    used: false,
                    revoked: false,
                    expiresAt: { lt: now },
                },
            }),
        ]);

        return {
            total,
            used,
            unused: total - used - revoked - expired,
            expired,
            revoked,
        };
    }
}

module.exports = new InviteService();
