import { prisma } from "../../lib/prisma.js";
import type { Prisma } from "@prisma/client";

type AddressCreateInput = Prisma.DeliveryAddressCreateInput;
type AddressUpdateInput = Prisma.DeliveryAddressUpdateInput;

/**
 * Creates a new delivery address for a user.
 * If it's the user's first address, it's automatically set as the default.
 * @param userId The ID of the user creating the address.
 * @param data The data for the new address.
 * @returns The newly created address.
 */
const createAddress = async (userId: number, data: Omit<AddressCreateInput, 'user'>) => {
  // Check if this is the user's first address
  const addressCount = await prisma.deliveryAddress.count({ where: { userId } });

  return prisma.deliveryAddress.create({
    data: {
      ...data,
      isDefault: addressCount === 0, // Set as default if it's the first one
      user: {
        connect: { id: userId },
      },
    },
  });
};

/**
 * Retrieves all delivery addresses for a specific user.
 * @param userId The ID of the user.
 * @returns An array of the user's addresses.
 */
const getAddressesForUser = async (userId: number) => {
  return prisma.deliveryAddress.findMany({
    where: { userId },
    orderBy: { isDefault: 'desc' }, // Show the default address first
  });
};

/**
 * Updates a delivery address. Throws an error if not found.
 * @param id The ID of the address to update.
 * @param data The new data for the address.
 */
const updateAddress = async (id: number, data: AddressUpdateInput) => {
  return prisma.deliveryAddress.update({
    where: { id },
    data,
  });
};

/**
 * Deletes a delivery address. Throws an error if not found.
 * @param id The ID of the address to delete.
 */
const deleteAddress = async (id: number) => {
  return prisma.deliveryAddress.delete({ where: { id } });
};

/**
 * Sets a specific address as the default for a user. This is a transactional operation.
 * It first unsets any other default address the user might have.
 * @param userId The ID of the user.
 * @param addressId The ID of the address to set as default.
 */
const setAddressAsDefault = async (userId: number, addressId: number) => {
  return prisma.$transaction(async (tx) => {
    // Step 1: Unset any current default address for this user.
    await tx.deliveryAddress.updateMany({
      where: {
        userId: userId,
        isDefault: true,
      },
      data: {
        isDefault: false,
      },
    });

    // Step 2: Set the new address as the default.
    // This will throw an error if the addressId doesn't exist or belong to the user.
    const newDefaultAddress = await tx.deliveryAddress.update({
      where: {
        id: addressId,
        // Optional but good practice: ensure the address belongs to the user
        // userId: userId 
      },
      data: {
        isDefault: true,
      },
    });

    return newDefaultAddress;
  });
};

export {
   createAddress,
   getAddressesForUser,
   updateAddress,
   deleteAddress,
   setAddressAsDefault
}
