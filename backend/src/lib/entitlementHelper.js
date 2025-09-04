import Entitlement from '../models/Entitlement.js';

/**
 * Safely create an entitlement with duplicate prevention
 * Uses MongoDB's upsert operation to handle race conditions
 * 
 * @param {Object} params - Entitlement parameters
 * @param {string} params.userId - User ID
 * @param {string} params.productId - Product ID  
 * @param {string} params.productSlug - Product slug
 * @param {Object} params.metadata - Additional metadata
 * @returns {Object} Result with success flag and entitlement info
 */
export async function createEntitlementSafe(params) {
  const { userId, productId, productSlug, metadata = {} } = params;
  
  try {
    console.log(`🔒 Safely creating entitlement for user ${userId}, product ${productSlug}`);
    
    // Use findOneAndUpdate with upsert to atomically check and create
    // This prevents race conditions where multiple processes try to create the same entitlement
    const result = await Entitlement.findOneAndUpdate(
      {
        userId: userId,
        productSlug: productSlug,
      },
      {
        $setOnInsert: {
          userId: userId,
          productId: productId,
          productSlug: productSlug,
          status: 'active',
          accessType: 'one_time',
          startsAt: new Date(),
          endsAt: null,
          metadata: {
            ...metadata,
            createdAt: new Date(),
          },
        }
      },
      {
        upsert: true, // Create if not exists
        new: true,    // Return the document after update
        setDefaultsOnInsert: true,
      }
    );
    
    // Check if this was a new creation or existing document
    const wasCreated = result.metadata?.createdAt && 
                      (new Date() - new Date(result.metadata.createdAt)) < 5000; // Within 5 seconds
    
    if (wasCreated) {
      console.log(`✅ Created new entitlement ${result._id} for product ${productSlug}`);
      return {
        success: true,
        created: true,
        entitlement: result,
        message: `Created entitlement for ${productSlug}`
      };
    } else {
      console.log(`ℹ️ Entitlement already exists for product ${productSlug} - prevented duplicate`);
      return {
        success: true,
        created: false,
        entitlement: result,
        message: `Entitlement for ${productSlug} already exists`
      };
    }
    
  } catch (error) {
    // Handle unique constraint violation (duplicate key error)
    if (error.code === 11000) {
      console.log(`ℹ️ Duplicate entitlement prevented by database constraint for product ${productSlug}`);
      
      // Fetch the existing entitlement
      const existing = await Entitlement.findOne({
        userId: userId,
        productSlug: productSlug,
      });
      
      return {
        success: true,
        created: false,
        entitlement: existing,
        message: `Entitlement for ${productSlug} already exists (prevented by constraint)`
      };
    }
    
    console.error(`❌ Error creating entitlement for product ${productSlug}:`, error);
    return {
      success: false,
      created: false,
      entitlement: null,
      error: error.message
    };
  }
}

/**
 * Get entitlements count by product slug for a user
 * @param {string} userId - User ID
 * @returns {Object} Count of entitlements by product slug
 */
export async function getEntitlementCounts(userId) {
  try {
    const pipeline = [
      { $match: { userId: userId, status: 'active' } },
      { $group: { _id: '$productSlug', count: { $sum: 1 } } },
      { $project: { productSlug: '$_id', count: 1, _id: 0 } }
    ];
    
    const results = await Entitlement.aggregate(pipeline);
    const counts = {};
    
    results.forEach(result => {
      counts[result.productSlug] = result.count;
    });
    
    return counts;
  } catch (error) {
    console.error('Error getting entitlement counts:', error);
    return {};
  }
}
