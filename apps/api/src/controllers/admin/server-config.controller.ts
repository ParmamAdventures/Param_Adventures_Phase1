import { Request, Response } from "express";
import { serverConfigService } from "../../services/server-config.service";
import { ApiResponse } from "../../utils/ApiResponse";
import { HttpError } from "../../utils/httpError";
import { auditService, AuditActions, AuditTargetTypes } from "../../services/audit.service";

/**
 * Get all server configurations grouped by category
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
export async function getServerConfigurations(req: Request, res: Response) {
  try {
    const configs = await serverConfigService.getAllConfigs();

    // Mask encrypted values in response
    const maskedConfigs = Object.entries(configs).reduce(
      (acc, [category, categoryConfigs]) => {
        acc[category] = categoryConfigs.map((config) => ({
          ...config,
          value: config.isEncrypted ? "[ENCRYPTED]" : config.value,
        }));
        return acc;
      },
      {} as Record<string, any[]>,
    );

    return ApiResponse.success(res, maskedConfigs, "Configurations fetched successfully");
  } catch (error) {
    console.error("Failed to fetch configurations:", error);
    return ApiResponse.error(res, "SERVER_ERROR", "Failed to fetch configurations");
  }
}

/**
 * Get configurations by category
 * @param {Request} req - Express request object with category param
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
export async function getConfigByCategory(req: Request, res: Response) {
  try {
    const { category } = req.params;

    if (!category) {
      throw new HttpError(400, "VALIDATION_ERROR", "Category is required");
    }

    const configs = await serverConfigService.getConfigByCategory(category);

    // Mask encrypted values
    const maskedConfigs = configs.map((config) => ({
      ...config,
      value: config.isEncrypted ? "[ENCRYPTED]" : config.value,
    }));

    return ApiResponse.success(res, maskedConfigs, `${category} configurations fetched`);
  } catch (error) {
    if (error instanceof HttpError) {
      return ApiResponse.error(res, error.code, error.message, error.status);
    }
    console.error("Failed to fetch configurations:", error);
    return ApiResponse.error(res, "SERVER_ERROR", "Failed to fetch configurations");
  }
}

/**
 * Update a server configuration
 * @param {Request} req - Express request object with category, key, value in body
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
export async function updateServerConfiguration(req: Request, res: Response) {
  try {
    const { category, key, value, description, dataType, isEncrypted } = req.body;
    const userId = req.user?.id;

    // Validation
    if (!category || !key || !value) {
      throw new HttpError(400, "VALIDATION_ERROR", "Category, key, and value are required");
    }

    if (!userId) {
      throw new HttpError(401, "UNAUTHORIZED", "User ID is required for audit logging");
    }

    // Update configuration
    const config = await serverConfigService.updateConfig(
      category,
      key,
      value,
      description,
      dataType || "string",
      isEncrypted || false,
      userId,
    );

    // Log audit trail
    await auditService.logAudit({
      action: AuditActions.SETTING_UPDATED,
      actorId: userId,
      targetType: AuditTargetTypes.SERVER_CONFIG,
      targetId: `${category}:${key}`,
      metadata: {
        category,
        key,
        description,
        dataType,
        isEncrypted,
      },
    });

    // Return masked value
    return ApiResponse.success(
      res,
      {
        ...config,
        value: config.isEncrypted ? "[ENCRYPTED]" : config.value,
      },
      "Configuration updated successfully",
    );
  } catch (error) {
    const typedError = error as
      | HttpError
      | (HttpError & { status?: number; code?: string; message?: string });

    if (
      typedError instanceof HttpError ||
      (typedError && (typedError as any).status && (typedError as any).code)
    ) {
      return ApiResponse.error(
        res,
        (typedError as any).code,
        (typedError as any).message,
        (typedError as any).status,
      );
    }

    console.error("Failed to update configuration:", error);
    return ApiResponse.error(res, "SERVER_ERROR", "Failed to update configuration");
  }
}

/**
 * Validate a configuration (test connectivity/validity)
 * @param {Request} req - Express request object with category and configs in body
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
export async function validateConfiguration(req: Request, res: Response) {
  try {
    const { category, configs } = req.body;

    if (!category || !configs) {
      throw new HttpError(400, "VALIDATION_ERROR", "Category and configurations are required");
    }

    const validationResult = await serverConfigService.validateConfig(category, configs);

    if (validationResult.valid) {
      return ApiResponse.success(res, validationResult, validationResult.message);
    } else {
      return ApiResponse.error(res, "VALIDATION_ERROR", validationResult.message, 400);
    }
  } catch (error) {
    if (error instanceof HttpError) {
      return ApiResponse.error(res, error.code, error.message, error.status);
    }
    console.error("Failed to validate configuration:", error);
    return ApiResponse.error(res, "SERVER_ERROR", "Validation failed");
  }
}
