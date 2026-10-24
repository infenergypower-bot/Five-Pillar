import { PrismaClient, Role } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();
const permissionKeys = [
  "clients.read",
  "clients.write",
  "costs.read",
  "costs.write",
  "quotes.approve",
  "margin.override",
  "projects.write",
  "finance.write",
  "ip.write",
  "integrations.write",
];

function required(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required`);
  return value;
}

async function main() {
  const email = required("BOOTSTRAP_ADMIN_EMAIL").toLowerCase();
  const password = required("BOOTSTRAP_ADMIN_PASSWORD");
  const name = process.env.BOOTSTRAP_ADMIN_NAME?.trim() || "Founder";

  if (!email.includes("@")) throw new Error("BOOTSTRAP_ADMIN_EMAIL must be a valid email address");
  if (password.length < 14) throw new Error("BOOTSTRAP_ADMIN_PASSWORD must contain at least 14 characters");

  const passwordHash = await hash(password, 12);

  await prisma.$transaction(async (tx) => {
    const organization = await tx.organization.upsert({
      where: { slug: "five-pillar" },
      update: { name: "Five Pillar Tech Ventures" },
      create: {
        name: "Five Pillar Tech Ventures",
        slug: "five-pillar",
      },
    });

    const founder = await tx.user.upsert({
      where: {
        organizationId_email: {
          organizationId: organization.id,
          email,
        },
      },
      update: {
        name,
        passwordHash,
        role: Role.SUPER_ADMIN,
        active: true,
        mfaRequired: false,
      },
      create: {
        organizationId: organization.id,
        email,
        name,
        passwordHash,
        role: Role.SUPER_ADMIN,
        mfaRequired: false,
      },
    });

    const founderRole = await tx.accessRole.upsert({
      where: {
        organizationId_name: {
          organizationId: organization.id,
          name: "Founder",
        },
      },
      update: {
        systemKey: Role.SUPER_ADMIN,
        description: "Full organization access",
      },
      create: {
        organizationId: organization.id,
        name: "Founder",
        systemKey: Role.SUPER_ADMIN,
        description: "Full organization access",
      },
    });

    await tx.userRole.upsert({
      where: {
        userId_roleId: {
          userId: founder.id,
          roleId: founderRole.id,
        },
      },
      update: {},
      create: {
        userId: founder.id,
        roleId: founderRole.id,
      },
    });

    for (const key of permissionKeys) {
      const permission = await tx.permission.upsert({
        where: { key },
        update: {},
        create: {
          key,
          description: `Permission: ${key}`,
        },
      });
      await tx.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: founderRole.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: founderRole.id,
          permissionId: permission.id,
        },
      });
    }
  });

  console.log(`Production founder account is ready for ${email}.`);
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : "Founder bootstrap failed");
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
