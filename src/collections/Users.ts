import { Access, CollectionConfig } from "payload/types";

export const Users: CollectionConfig = {
  slug: "users",
  auth: {
    verify: {
      generateEmailHTML: ({ token }) => { return `<a href="http://localhost:3000/verify-email?token=${token}">Verify Email</a>`},
    }
  },
  access: {
    read: () => true,
    create: () => true,
  },
  fields: [
    {
      name: "role",
      defaultValue: "user",
      admin: {
        condition: ({ req }) => req.user.role === "admin",
      },
      type: "select",
      options: [
        {
          label: "Admin",
          value: "admin",
        },
        {
          label: "User",
          value: "user",
        },
      ],
    },
  ],
};
