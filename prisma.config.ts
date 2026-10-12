import { definePrismaConfig } from "prisma/config";
import "prisma/config"

export default definePrismaConfig({
  schema:"prisma/prisma.schema",
  migrations:{
    path:"prisma/migrations",
  },
  datasource:{
    url:process.env["DATABASE_URL"]
  },
  skills: {
    agents: ["claude", "cursor", "agents", "devin"],
  },
});
