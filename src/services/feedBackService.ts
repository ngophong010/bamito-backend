import db, { sequelize } from "../models/index.js"; // Import the sequelize instance for transactions
import type { ServiceResponse } from "../types/serviceResponse.js";
import { Op } from "sequelize";

// Define the shape of the feedback data for type safety
interface FeedbackData {
  userId: number;
  productId: number;
  orderId: number; // Needed to update the correct order history item
  sizeId: number;   // Needed to update the correct order history item
  description: string | null;
  rating: number;
}

// --- CREATE ---
const createNewFeedBackService = async (data: FeedbackData): Promise<ServiceResponse> => {
  const { userId, productId, orderId, sizeId, description, rating } = data;
  if (!userId || !productId || !orderId || !sizeId || rating == null) {
    return { errCode: 1, message: "Missing required parameters!" };
  }

  // ENHANCEMENT 1: Use a transaction to ensure data integrity.
  try {
    const result = await sequelize.transaction(async (t) => {
      // Step 1: Create the new feedback record within the transaction
      await db.Feedback.create({
        userId,
        productId,
        description,
        rating,
      }, { transaction: t });

      // Step 2: Find and update the order history record within the same transaction
      const orderHistoryItem = await db.Order_History.findOne({
        where: { orderId, productId, sizeId },
        transaction: t, // Ensure this operation is part of the transaction
        raw: false,
      });

      if (!orderHistoryItem) {
        // If the item doesn't exist, we must throw an error to roll back the transaction.
        throw new Error("Order history item not found. Rolling back.");
      }

      orderHistoryItem.statusFeedback = 1;
      await orderHistoryItem.save({ transaction: t });

      // If both operations succeed, the transaction will commit.
      return { errCode: 0, message: "Feedback created successfully." };
    });
    return result;
  } catch (error: unknown) {
    console.error("Transaction failed:", error);
    // The asyncHandler in the controller will catch this and send a 500 error.
    // We can also check for specific errors, like the unique constraint.
    if (error instanceof Error && error.name === 'SequelizeUniqueConstraintError') {
      return { errCode: 3, message: "You have already submitted feedback for this product." };
    }
    throw error; // Re-throw other errors to be handled by the global error handler
  }
};

// --- DELETE ---
const deleteFeedbackService = async (feedbackId: number): Promise<ServiceResponse> => {
  if (!feedbackId) {
    return { errCode: 1, message: "Missing required feedback ID!" };
  }
  const deletedRowCount = await db.Feedback.destroy({ where: { id: feedbackId } });
  if (deletedRowCount === 0) {
    return { errCode: 2, message: "Feedback not found." };
  }
  return { errCode: 0, message: "Feedback deleted successfully." };
};

// --- UPDATE ---
const updateFeedbackService = async (data: { feedbackId: number; description: string; rating: number }): Promise<ServiceResponse> => {
  if (!data.feedbackId) {
    return { errCode: 1, message: "Missing required feedback ID!" };
  }
  const feedback = await db.Feedback.findByPk(data.feedbackId);
  if (!feedback) {
    return { errCode: 4, message: "Feedback not found." };
  }
  await feedback.update({ description: data.description, rating: data.rating });
  return { errCode: 0, message: "Feedback updated successfully." };
};

// --- READ (GET ALL FOR A PRODUCT) ---
const getAllFeedbackService = async (productId: number): Promise<ServiceResponse> => {
  if (!productId) {
    return { errCode: 1, message: "Missing required product ID!" };
  }
  const feedbacks = await db.Feedback.findAll({
    where: { productId },
    include: [{
      model: db.User,
      as: "userData", // Use the correct alias from your refactored model
      attributes: ["userName", "email", "avatar"],
    }],
    order: [["updatedAt", "DESC"]],
  });

  return { errCode: 0, data: feedbacks, message: "Get all feadback failed" };
};

export {
  createNewFeedBackService,
  getAllFeedbackService,
  updateFeedbackService,
  deleteFeedbackService,
};
