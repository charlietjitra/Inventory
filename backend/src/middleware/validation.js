// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const Joi = require("joi");

const schemas = {
  // Species
  createSpecies: Joi.object({
    species_name: Joi.string().max(100).required(),
    description: Joi.string().max(500).optional(),
  }),

  updateSpecies: Joi.object({
    species_name: Joi.string().max(100).optional(),
    description: Joi.string().max(500).optional(),
  }).min(1),

  // Subspecies
  createSubspecies: Joi.object({
    species_id: Joi.number().integer().positive().required(),
    subspecies_name: Joi.string().max(100).required(),
    description: Joi.string().max(500).optional(),
  }),

  updateSubspecies: Joi.object({
    subspecies_name: Joi.string().max(100).optional(),
    description: Joi.string().max(500).optional(),
  }).min(1),

  // Size Category
  createSizeCategory: Joi.object({
    category_name: Joi.string().max(50).required(),
    min_weight_kg: Joi.number().precision(2).min(0).required(),
    max_weight_kg: Joi.number()
      .precision(2)
      .min(Joi.ref("min_weight_kg"))
      .required(),
  }),

  updateSizeCategory: Joi.object({
    category_name: Joi.string().max(50).optional(),
    min_weight_kg: Joi.number().precision(2).min(0).optional(),
    max_weight_kg: Joi.number().precision(2).optional(),
  }).min(1),

  // Item
  createItem: Joi.object({
    species_id: Joi.number().integer().positive().required(),
    subspecies_id: Joi.number().integer().positive().required(),
    size_category_id: Joi.number().integer().positive().required(),
  }),

  // Owner
  createOwner: Joi.object({
    owner_name: Joi.string().max(150).required(),
    contact_info: Joi.string().max(255).optional(),
  }),

  updateOwner: Joi.object({
    owner_name: Joi.string().max(150).optional(),
    contact_info: Joi.string().max(255).optional(),
  }).min(1),

  // Owner-Item relationships
  addItemToOwner: Joi.object({
    owner_id: Joi.number().integer().positive().required(),
    item_id: Joi.number().integer().positive().required(),
  }),

  removeItemFromOwner: Joi.object({
    owner_id: Joi.number().integer().positive().required(),
    item_id: Joi.number().integer().positive().required(),
  }),

  // Pallet
  createPallet: Joi.object({
    notes: Joi.string().max(500).allow(null).optional(),
  }),

  // Pallet Location Assignment
  assignLocation: Joi.object({
    lot_id: Joi.string().max(20).required(),
    moved_by: Joi.string().max(150).required(),
    notes: Joi.string().max(500).allow(null).optional(),
  }),

  // Pallet Contents
  addContents: Joi.object({
    owner_id: Joi.number().integer().positive().required(),
    item_id: Joi.number().integer().positive().required(),
    quantity_kg: Joi.number().precision(2).positive().required(),
    modified_by: Joi.string().max(150).required(),
    notes: Joi.string().max(500).allow(null).optional(),
  }),

  removeContents: Joi.object({
    content_id: Joi.number().integer().positive().required(),
    modified_by: Joi.string().max(150).required(),
    notes: Joi.string().max(500).allow(null).optional(),
  }),

  movePallet: Joi.object({
    new_lot_id: Joi.string().max(20).required(),
    moved_by: Joi.string().max(150).required(),
    notes: Joi.string().max(500).allow(null).optional(),
  }),

  // Auth
  register: Joi.object({
    username: Joi.string().alphanum().min(3).max(100).required(),
    email: Joi.string().email().max(255).required(),
    password: Joi.string().min(8).max(255).required(),
    role: Joi.string().valid("ADMIN", "MANAGER", "STAFF").optional(),
  }),

  login: Joi.object({
    username: Joi.string().max(100).required(),
    password: Joi.string().required(),
  }),

  updateUser: Joi.object({
    email: Joi.string().email().max(255).optional(),
    role: Joi.string().valid("ADMIN", "MANAGER", "STAFF").optional(),
    is_active: Joi.boolean().optional(),
  }).min(1),

  updateUserSelf: Joi.object({
    email: Joi.string().email().max(255).optional(),
  }).min(1),

  changePassword: Joi.object({
    current_password: Joi.string().optional(),
    new_password: Joi.string().min(8).max(255).required(),
  }),

  // Notifications
  saveFCMToken: Joi.object({
    token: Joi.string().required().description('FCM token for push notifications'),
  }),

  sendNotificationToUser: Joi.object({
    userId: Joi.number().integer().positive().required(),
    title: Joi.string().min(1).max(100).required(),
    body: Joi.string().min(1).max(500).required(),
    data: Joi.object().optional().default({}),
  }),

  sendBroadcastNotification: Joi.object({
    title: Joi.string().min(1).max(100).required(),
    body: Joi.string().min(1).max(500).required(),
    data: Joi.object().optional().default({}),
  }),
};

// Validation middleware factory
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      stripUnknown: true,
      abortEarly: false,
    });

    if (error) {
      error.isJoi = true;
      return next(error);
    }

    req.validated = value;
    next();
  };
};

module.exports = {
  schemas,
  validate,
};
