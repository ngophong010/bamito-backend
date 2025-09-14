import { prisma } from "../../lib/prisma.js";
import type { Prisma } from "@prisma/client";

// Use a specific, clear interface for the creation data
interface FeedbackCreateInput {
  userId: number;
  productId: number;
  orderId: number;
  sizeId: number;
  description: string | null;
  rating: number;
}

/**
 * Creates new feedback for a product and marks the corresponding order item as reviewed.
 * This is a transactional operation.
 * @param data The data for the new feedback.
 * @returns The newly created feedback.
 */
export const createFeedback = async (data: FeedbackCreateInput) => {
  const { userId, productId, orderId, sizeId, description, rating } = data;
  if (!userId || !productId || !orderId || !sizeId || rating == null) {
    throw new Error("Missing required parameters!");
  }

  // Prisma's interactive transaction ensures both operations succeed or both fail.
  try {
    return await prisma.$transaction(async (tx) => {
      // Step 1: Create the new feedback record.
      // The @@unique([userId, productId]) constraint in the schema will throw
      // a P2002 error if the user has already reviewed this product.
      const newFeedback = await tx.feedback.create({
        data: {
          userId,
          productId,
          description,
          rating,
        },
      });

      // Step 2: Update the specific order history item to mark it as reviewed.
      // `updateMany` returns a count of updated records.
      const updateResult = await tx.orderHistory.updateMany({
        where: {
          orderId,
          productId,
          sizeId,
          order: { userId } // Extra check to ensure the order belongs to the user
        },
        data: {
          statusFeedback: 1, // 1 = reviewed
        },
      });

      // If the update affected 0 rows, it means the order item wasn't found.
      // We must throw an error to roll back the transaction.
      if (updateResult.count === 0) {
        throw new Error("Corresponding order history item not found. Rolling back.");
      }

      return newFeedback;
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new Error("You have already submitted feedback for this product.");
    }
    // Re-throw other errors (like the "not found" error above)
    throw error;
  }
};

/**
 * Retrieves all feedback for a specific product, including user details.
 * @param productId The ID of the product.
 * @returns An array of feedback objects.
 */
export const getAllFeedbackForProduct = async (productId: number) => {
  if (!productId) {
    throw new Error("Missing required product ID!");
  }

  return prisma.feedback.findMany({
    where: { productId },
    include: {
      // Include the related user and select only the fields you want to expose.
      user: {
        select: {
          userName: true,
          email: true, // Be careful about exposing emails publicly
          avatar: true,
        },
      },
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });
};

/**
 * Updates the text and rating of an existing feedback entry.
 * @param id The ID of the feedback to update.
 * @param data The new data for the feedback.
 * @returns The updated feedback.
 */
export const updateFeedback = async (id: number, data: { description?: string | null; rating?: number }) => {
  return prisma.feedback.update({
    where: { id },
    data,
  });
};

/**
 * Deletes a feedback entry by its primary key ID.
 * @param id The ID of the feedback to delete.
 */
export const deleteFeedback = async (id: number) => {
  // `delete` will automatically throw a catchable P2025 error if the record is not found.
  return prisma.feedback.delete({ where: { id } });
};
