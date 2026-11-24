import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from '../../services/prisma.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../utils/jwt.js';
import { BadRequestError, UnauthorizedError, ConflictError, NotFoundError } from '../../utils/errors.js';
import { sendEmail } from '../../services/email.js';
import { Role } from '@prisma/client';

export class AuthService {
  async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    organizationName?: string;
    jobTitle?: string;
    timezone?: string;
  }) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictError('An account with this email already exists');
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const emailVerifyToken = crypto.randomBytes(32).toString('hex');

    // Transaction to create User and Organization if provided
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: data.email.toLowerCase(),
          passwordHash,
          firstName: data.firstName,
          lastName: data.lastName,
          jobTitle: data.jobTitle,
          timezone: data.timezone || 'UTC',
          emailVerifyToken,
        },
      });

      let org = null;
      let member = null;

      if (data.organizationName) {
        const slug = data.organizationName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '') + '-' + Math.floor(1000 + Math.random() * 9000);

        org = await tx.organization.create({
          data: {
            name: data.organizationName,
            slug,
            createdById: user.id,
          },
        });

        member = await tx.organizationMember.create({
          data: {
            organizationId: org.id,
            userId: user.id,
            role: Role.ORG_ADMIN,
          },
        });
      }

      return { user, org, member };
    });

    const tokenPayload = {
      userId: result.user.id,
      email: result.user.email,
      organizationId: result.org?.id,
      role: result.member?.role,
    };

    const accessToken = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken(tokenPayload);

    // Create session
    await prisma.userSession.create({
      data: {
        userId: result.user.id,
        refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      user: {
        id: result.user.id,
        email: result.user.email,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        jobTitle: result.user.jobTitle,
        timezone: result.user.timezone,
      },
      organization: result.org,
      tokens: { accessToken, refreshToken },
    };
  }

  async login(email: string, password: string, userAgent?: string, ipAddress?: string) {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        memberships: {
          include: {
            organization: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Default to the first active membership
    const activeMember = user.memberships.find((m) => m.status === 'ACTIVE');

    const tokenPayload = {
      userId: user.id,
      email: user.email,
      organizationId: activeMember?.organizationId,
      role: activeMember?.role,
    };

    const accessToken = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken(tokenPayload);

    // Save session in database
    await prisma.userSession.create({
      data: {
        userId: user.id,
        refreshToken,
        userAgent,
        ipAddress,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatarUrl: user.avatarUrl,
        jobTitle: user.jobTitle,
        timezone: user.timezone,
      },
      membership: activeMember,
      tokens: { accessToken, refreshToken },
    };
  }

  async refreshTokens(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedError('Refresh token required');
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    const session = await prisma.userSession.findUnique({
      where: { refreshToken },
      include: { user: true },
    });

    if (!session || session.isRevoked || new Date() > session.expiresAt) {
      throw new UnauthorizedError('Session expired or revoked');
    }

    // Rotate refresh token
    const newAccessToken = signAccessToken({
      userId: session.user.id,
      email: session.user.email,
      organizationId: decoded.organizationId,
      role: decoded.role,
    });
    const newRefreshToken = signRefreshToken({
      userId: session.user.id,
      email: session.user.email,
      organizationId: decoded.organizationId,
      role: decoded.role,
    });

    // Revoke old session and issue new one
    await prisma.$transaction([
      prisma.userSession.update({
        where: { id: session.id },
        data: { isRevoked: true },
      }),
      prisma.userSession.create({
        data: {
          userId: session.user.id,
          refreshToken: newRefreshToken,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      }),
    ]);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(refreshToken?: string) {
    if (refreshToken) {
      await prisma.userSession.updateMany({
        where: { refreshToken },
        data: { isRevoked: true },
      });
    }
    return true;
  }

  async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      // Don't leak user existence
      return true;
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetExpires,
      },
    });

    await sendEmail({
      to: user.email,
      subject: 'AsyncFlow: Password Reset Instructions',
      html: `
        <h2>Password Reset Request</h2>
        <p>Hello ${user.firstName},</p>
        <p>You requested a password reset for your AsyncFlow enterprise account.</p>
        <p>Use the following token or link to reset your password:</p>
        <p><strong>Reset Token:</strong> <code>${resetToken}</code></p>
        <p>This token is valid for 60 minutes.</p>
      `,
      text: `Reset token: ${resetToken}`,
    });

    return true;
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { gt: new Date() },
      },
    });

    if (!user) {
      throw new BadRequestError('Invalid or expired password reset token');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    // Revoke all existing sessions for security
    await prisma.userSession.updateMany({
      where: { userId: user.id },
      data: { isRevoked: true },
    });

    return true;
  }

  async getMe(userId: string, currentOrgId?: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        jobTitle: true,
        timezone: true,
        isEmailVerified: true,
        createdAt: true,
        memberships: {
          include: {
            organization: true,
            department: true,
            team: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    let activeMembership = user.memberships.find(
      (m) => m.organizationId === currentOrgId
    );

    if (!activeMembership && user.memberships.length > 0) {
      activeMembership = user.memberships[0];
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatarUrl: user.avatarUrl,
        jobTitle: user.jobTitle,
        timezone: user.timezone,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt,
      },
      currentMembership: activeMembership,
      memberships: user.memberships,
    };
  }
}

export const authService = new AuthService();
