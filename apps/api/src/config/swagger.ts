import swaggerJsdoc from "swagger-jsdoc";
import { version } from "../../package.json";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Param Adventures API",
      version,
      description: "API documentation for the Param Adventures Phase 1 backend project.",
      contact: {
        name: "Developer",
        email: "support@paramadventures.com",
      },
    },
    servers: [
      {
        url: "http://localhost:3001",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/routes/*.ts", "./src/controllers/**/*.ts"], // Path to the API docs
};

export const swaggerSpec = swaggerJsdoc(options);
