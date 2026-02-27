// ============================================================================
// PALLETS CONTROLLER (MOST CRITICAL)
// ============================================================================

const pool = require("../db");
const { BusinessError } = require("../middleware/errorHandler");
const {
  getPaginationParams,
  formatPaginatedResponse,
} = require("../middleware/pagination");
const { sendNotificationToDevice } = require("../config/firebaseAdmin");

const palletsController = {
  // Create new pallet
  async createPallet(req, res) {
    const { notes } = req.validated;
    const userId = req.user.user_id;
    const username = req.user.username;

    const result = await pool.query(
      "INSERT INTO pallets (pallet_id, status, notes) VALUES (DEFAULT, $1, $2) RETURNING *",
      ["EMPTY", notes || null],
    );

    const newPallet = result.rows[0];

    // Send notification to the user who created the pallet
    console.log(`🔄 Attempting to send notification for pallet #${newPallet.pallet_id}...`);
    
    try {
      const userResult = await pool.query(
        "SELECT fcm_token FROM users WHERE user_id = $1 AND fcm_token IS NOT NULL",
        [userId]
      );

      console.log(`📊 Found ${userResult.rows.length} users with FCM tokens for user_id: ${userId}`);

      if (userResult.rows.length > 0) {
        const fcmToken = userResult.rows[0].fcm_token;
        console.log(`🎯 Sending notification to token: ${fcmToken ? fcmToken.substring(0, 20) + '...' : 'null'}`);
        
        const notificationResult = await sendNotificationToDevice(
          fcmToken,
          "Pallet Created Successfully! 📦",
          `You just added Pallet #${newPallet.pallet_id}. Status: ${newPallet.status}`,
          {
            type: "pallet_created",
            pallet_id: newPallet.pallet_id.toString(),
            created_by: username
          }
        );
        
        console.log('📱 Notification result:', notificationResult);
      } else {
        console.log('⚠️  No FCM token found for this user');
      }
    } catch (notificationError) {
      console.error('❌ Failed to send pallet creation notification:', notificationError);
      // Don't fail the pallet creation if notification fails
    }

    res.status(201).json(newPallet);
  },

  // Get all pallets with pagination
  async getAllPallets(req, res) {
    const { page, limit, offset } = getPaginationParams(req, 50);

    // Get total count
    const countResult = await pool.query(
      "SELECT COUNT(*) FROM v_pallet_current_status",
    );
    const total = parseInt(countResult.rows[0].count);

    // Get paginated results
    const result = await pool.query(
      "SELECT * FROM v_pallet_current_status ORDER BY pallet_id LIMIT $1 OFFSET $2",
      [limit, offset],
    );

    res.json(formatPaginatedResponse(result.rows, total, page, limit));
  },

  // Get pallet current status
  async getPalletStatus(req, res) {
    const { id } = req.params;

    const result = await pool.query(
      "SELECT * FROM v_pallet_current_status WHERE pallet_id = $1",
      [id],
    );

    if (result.rows.length === 0) {
      throw new BusinessError("Pallet not found", 404, "Not Found");
    }

    // Get contents breakdown
    const contentsResult = await pool.query(
      `SELECT pc.content_id, pc.owner_id, o.owner_name, pc.item_id, pc.quantity_kg, pc.added_at, pc.notes
       FROM pallet_contents pc
       JOIN owners o ON pc.owner_id = o.owner_id
       WHERE pc.pallet_id = $1 AND pc.removed_at IS NULL
       ORDER BY pc.added_at`,
      [id],
    );

    const response = result.rows[0];
    response.contents = contentsResult.rows;

    res.json(response);
  },

  // Get complete pallet history
  async getPalletHistory(req, res) {
    const { id } = req.params;

    // Verify pallet exists
    const palletResult = await pool.query(
      "SELECT * FROM pallets WHERE pallet_id = $1",
      [id],
    );
    if (palletResult.rows.length === 0) {
      throw new BusinessError("Pallet not found", 404, "Not Found");
    }

    // Location history
    const locationsResult = await pool.query(
      `SELECT location_id, lot_id, moved_in_at, moved_out_at, moved_by, notes
       FROM pallet_locations
       WHERE pallet_id = $1
       ORDER BY moved_in_at DESC`,
      [id],
    );

    // Contents history
    const contentsResult = await pool.query(
      `SELECT pc.content_id, pc.owner_id, o.owner_name, pc.item_id, pc.quantity_kg, pc.added_at, pc.removed_at, pc.modified_by, pc.notes
       FROM pallet_contents pc
       JOIN owners o ON pc.owner_id = o.owner_id
       WHERE pc.pallet_id = $1
       ORDER BY pc.added_at DESC`,
      [id],
    );

    res.json({
      pallet_id: id,
      locations: locationsResult.rows,
      contents: contentsResult.rows,
    });
  },

  // OPTIMIZED: Get complete pallet detail with all related data (reduces 4+ queries to 1)
  async getPalletDetailOptimized(req, res) {
    const { id } = req.params;

    try {
      // Execute all queries in parallel
      const [
        palletResult,
        locationsResult,
        currentContentsResult,
        allContentsHistoryResult,
        ownersResult,
        lotsResult,
        allItemsResult,
      ] = await Promise.all([
        // Current pallet status
        pool.query(
          "SELECT * FROM v_pallet_current_status WHERE pallet_id = $1",
          [id],
        ),
        // Location history
        pool.query(
          `SELECT location_id, lot_id, moved_in_at, moved_out_at, moved_by, notes
           FROM pallet_locations
           WHERE pallet_id = $1
           ORDER BY moved_in_at DESC`,
          [id],
        ),
        // Current contents only (for display in pallet contents section)
        pool.query(
          `SELECT pc.content_id, pc.owner_id, o.owner_name, pc.item_id, pc.quantity_kg, pc.added_at, pc.removed_at, pc.modified_by, pc.notes
           FROM pallet_contents pc
           JOIN owners o ON pc.owner_id = o.owner_id
           WHERE pc.pallet_id = $1 AND pc.removed_at IS NULL
           ORDER BY pc.added_at DESC`,
          [id],
        ),
        // All contents history including removed (for history timeline)
        pool.query(
          `SELECT pc.content_id, pc.owner_id, o.owner_name, pc.item_id, pc.quantity_kg, pc.added_at, pc.removed_at, pc.modified_by, pc.notes
           FROM pallet_contents pc
           JOIN owners o ON pc.owner_id = o.owner_id
           WHERE pc.pallet_id = $1
           ORDER BY pc.added_at DESC`,
          [id],
        ),
        // All active owners (for dropdown)
        pool.query(
          `SELECT owner_id, owner_name FROM owners WHERE removed_at IS NULL ORDER BY owner_name`,
        ),
        // All lots (for dropdown)
        pool.query(`SELECT lot_id FROM lots ORDER BY lot_id`),
        // All items by owner (pre-loaded for filtering)
        pool.query(
          `SELECT i.item_id, oi.owner_id, s.species_name, sc.category_name
           FROM items i
           JOIN owner_items oi ON i.item_id = oi.item_id
           JOIN species s ON i.species_id = s.species_id
           JOIN size_categories sc ON i.size_category_id = sc.size_category_id
           ORDER BY oi.owner_id, s.species_name`,
        ),
      ]);

      if (palletResult.rows.length === 0) {
        throw new BusinessError("Pallet not found", 404, "Not Found");
      }

      // Group items by owner for easier filtering on frontend
      const itemsByOwner = {};
      allItemsResult.rows.forEach((item) => {
        if (!itemsByOwner[item.owner_id]) {
          itemsByOwner[item.owner_id] = [];
        }
        itemsByOwner[item.owner_id].push({
          item_id: item.item_id,
          species_name: item.species_name,
          category_name: item.category_name,
        });
      });

      // Return all data in single response
      res.json({
        pallet: {
          ...palletResult.rows[0],
          contents: currentContentsResult.rows,
        },
        history: {
          locations: locationsResult.rows,
          contents: allContentsHistoryResult.rows,
        },
        dropdowns: {
          owners: ownersResult.rows,
          lots: lotsResult.rows,
          itemsByOwner: itemsByOwner,
        },
      });
    } catch (error) {
      throw error;
    }
  },

  // WORKFLOW A: Assign pallet to location
  async assignLocationToPallet(req, res) {
    const { id } = req.params;
    const { lot_id, moved_by, notes } = req.validated;

    // Verify pallet exists
    const palletResult = await pool.query(
      "SELECT * FROM pallets WHERE pallet_id = $1",
      [id],
    );
    if (palletResult.rows.length === 0) {
      throw new BusinessError("Pallet not found", 404, "Not Found");
    }

    // Verify lot exists
    const lotResult = await pool.query("SELECT * FROM lots WHERE lot_id = $1", [
      lot_id,
    ]);
    if (lotResult.rows.length === 0) {
      throw new BusinessError("Lot not found", 404, "Not Found");
    }

    // Check if lot is already occupied
    const occupancyResult = await pool.query(
      "SELECT * FROM pallet_locations WHERE lot_id = $1 AND moved_out_at IS NULL",
      [lot_id],
    );

    if (occupancyResult.rows.length > 0) {
      throw new BusinessError(
        "Lot is already occupied by pallet " +
          occupancyResult.rows[0].pallet_id,
        400,
        "Lot Occupied",
      );
    }

    // Check if pallet is already in a location
    const currentLocationResult = await pool.query(
      "SELECT * FROM pallet_locations WHERE pallet_id = $1 AND moved_out_at IS NULL",
      [id],
    );

    // Use transaction
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // If pallet is already in a location, mark it as moved out
      if (currentLocationResult.rows.length > 0) {
        await client.query(
          "UPDATE pallet_locations SET moved_out_at = NOW() WHERE location_id = $1",
          [currentLocationResult.rows[0].location_id],
        );
      }

      // Insert new location record
      const insertResult = await client.query(
        "INSERT INTO pallet_locations (pallet_id, lot_id, moved_in_at, moved_by, notes) VALUES ($1, $2, NOW(), $3, $4) RETURNING *",
        [id, lot_id, moved_by, notes || null],
      );

      await client.query("COMMIT");

      res.status(201).json({
        message: "Pallet assigned to location",
        location: insertResult.rows[0],
      });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },

  // WORKFLOW B: Add contents to pallet
  async addContentsToPallet(req, res) {
    const { id } = req.params;
    const { owner_id, item_id, quantity_kg, modified_by, notes } =
      req.validated;

    // Verify pallet exists
    const palletResult = await pool.query(
      "SELECT * FROM pallets WHERE pallet_id = $1",
      [id],
    );
    if (palletResult.rows.length === 0) {
      throw new BusinessError("Pallet not found", 404, "Not Found");
    }

    // // Check if pallet already has contents with different item_id
    // const existingContentsResult = await pool.query(
    //   `SELECT DISTINCT item_id FROM pallet_contents
    //    WHERE pallet_id = $1 AND removed_at IS NULL`,
    //   [id],
    // );

    // if (existingContentsResult.rows.length > 0) {
    //   const existingItemId = existingContentsResult.rows[0].item_id;
    //   if (existingItemId !== item_id) {
    //     throw new BusinessError(
    //       "You can only add the same item to this pallet. Pallet already contains a different item.",
    //       400,
    //       "Invalid Item",
    //     );
    //   }
    // }

    // Verify owner exists and is not removed
    const ownerResult = await pool.query(
      "SELECT * FROM owners WHERE owner_id = $1 AND removed_at IS NULL",
      [owner_id],
    );

    if (ownerResult.rows.length === 0) {
      throw new BusinessError("Owner not found or removed", 404, "Not Found");
    }

    // Verify item exists
    const itemResult = await pool.query(
      "SELECT * FROM items WHERE item_id = $1",
      [item_id],
    );
    if (itemResult.rows.length === 0) {
      throw new BusinessError("Item not found", 404, "Not Found");
    }

    // Verify owner supplies this item (check owner_items junction table)
    const ownerItemResult = await pool.query(
      "SELECT * FROM owner_items WHERE owner_id = $1 AND item_id = $2",
      [owner_id, item_id],
    );

    if (ownerItemResult.rows.length === 0) {
      throw new BusinessError(
        "Owner does not supply this item",
        400,
        "Invalid Owner Item",
      );
    }

    // Check pallet's locked item_id before attempting insert
    const palletCheckResult = await pool.query(
      `SELECT item_id FROM pallets WHERE pallet_id = $1`,
      [id],
    );

    if (
      palletCheckResult.rows.length > 0 &&
      palletCheckResult.rows[0].item_id !== null &&
      palletCheckResult.rows[0].item_id !== item_id
    ) {
      // Get the locked item info for better error message
      const lockedItemResult = await pool.query(
        `SELECT i.item_id, s.species_name, sc.category_name 
         FROM items i 
         LEFT JOIN species s ON i.species_id = s.species_id
         LEFT JOIN size_categories sc ON i.size_category_id = sc.size_category_id
         WHERE i.item_id = $1`,
        [palletCheckResult.rows[0].item_id],
      );

      const lockedItemInfo = lockedItemResult.rows[0]
        ? `${lockedItemResult.rows[0].species_name} (${lockedItemResult.rows[0].category_name})`
        : `item ${palletCheckResult.rows[0].item_id}`;

      throw new BusinessError(
        `This pallet is locked to ${lockedItemInfo}. Cannot add different item types to the same pallet.`,
        400,
        "Pallet Item Locked",
      );
    }

    // Add contents (trigger will handle pallet locking)
    const result = await pool.query(
      "INSERT INTO pallet_contents (pallet_id, owner_id, item_id, quantity_kg, modified_by, notes) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [id, owner_id, item_id, quantity_kg, modified_by, notes || null],
    );

    res.status(201).json({
      message: "Contents added to pallet",
      content: result.rows[0],
    });
  },

  // Remove contents from pallet
  async removeContentsFromPallet(req, res) {
    const { id } = req.params;
    const { content_id, modified_by, notes } = req.validated;

    // Verify pallet exists
    const palletResult = await pool.query(
      "SELECT * FROM pallets WHERE pallet_id = $1",
      [id],
    );
    if (palletResult.rows.length === 0) {
      throw new BusinessError("Pallet not found", 404, "Not Found");
    }

    // Verify content exists and belongs to pallet
    const contentResult = await pool.query(
      "SELECT * FROM pallet_contents WHERE content_id = $1 AND pallet_id = $2 AND removed_at IS NULL",
      [content_id, id],
    );

    if (contentResult.rows.length === 0) {
      throw new BusinessError("Content not found in pallet", 404, "Not Found");
    }

    const result = await pool.query(
      "UPDATE pallet_contents SET removed_at = NOW(), modified_by = $1, notes = $2 WHERE content_id = $3 RETURNING *",
      [modified_by, notes || null, content_id],
    );

    res.json({
      message: "Content removed from pallet",
      content: result.rows[0],
    });
  },

  // Move pallet to new location
  async movePallet(req, res) {
    const { id } = req.params;
    const { new_lot_id, moved_by, notes } = req.validated;

    // Verify pallet exists
    const palletResult = await pool.query(
      "SELECT * FROM pallets WHERE pallet_id = $1",
      [id],
    );
    if (palletResult.rows.length === 0) {
      throw new BusinessError("Pallet not found", 404, "Not Found");
    }

    // Verify lot exists
    const lotResult = await pool.query("SELECT * FROM lots WHERE lot_id = $1", [
      new_lot_id,
    ]);
    if (lotResult.rows.length === 0) {
      throw new BusinessError("Lot not found", 404, "Not Found");
    }

    // Check if pallet is currently in a location
    const currentLocationResult = await pool.query(
      "SELECT * FROM pallet_locations WHERE pallet_id = $1 AND moved_out_at IS NULL",
      [id],
    );

    if (currentLocationResult.rows.length === 0) {
      throw new BusinessError(
        "Pallet is not assigned to any location",
        400,
        "Not Assigned",
      );
    }

    // Check if new lot is occupied
    const occupancyResult = await pool.query(
      "SELECT * FROM pallet_locations WHERE lot_id = $1 AND moved_out_at IS NULL",
      [new_lot_id],
    );

    if (occupancyResult.rows.length > 0) {
      throw new BusinessError("Lot is already occupied", 400, "Lot Occupied");
    }

    // Use transaction for atomic movement
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // Mark old location as moved out
      await client.query(
        "UPDATE pallet_locations SET moved_out_at = NOW() WHERE location_id = $1",
        [currentLocationResult.rows[0].location_id],
      );

      // Insert new location
      const insertResult = await client.query(
        "INSERT INTO pallet_locations (pallet_id, lot_id, moved_in_at, moved_by, notes) VALUES ($1, $2, NOW(), $3, $4) RETURNING *",
        [id, new_lot_id, moved_by, notes || null],
      );

      await client.query("COMMIT");

      res.status(201).json({
        message: "Pallet moved to new location",
        location: insertResult.rows[0],
      });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },

  // Get pallet storage duration statistics
  async getPalletStorageDuration(req, res) {
    const result = await pool.query(
      "SELECT * FROM v_pallet_storage_duration ORDER BY pallet_id",
    );
    res.json(result.rows);
  },
};

module.exports = palletsController;
