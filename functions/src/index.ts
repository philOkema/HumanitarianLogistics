import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin
admin.initializeApp();

const db = admin.firestore();
const auth = admin.auth();

// Define valid roles
const VALID_ROLES = ['admin', 'staff', 'donor', 'beneficiary'] as const;

// Cloud Function to handle user role updates
export const updateUserRole = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to update roles'
    );
  }

  const { userId, newRole } = data;

  // Validate input
  if (!userId || !newRole) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'User ID and new role are required'
    );
  }

  if (!VALID_ROLES.includes(newRole)) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Invalid role specified'
    );
  }

  try {
    // Check if the requesting user is an admin
    const requesterDoc = await db.collection('users').doc(context.auth.uid).get();
    const requesterData = requesterDoc.data();

    if (!requesterData || requesterData.role !== 'admin') {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Only admins can update user roles'
      );
    }

    // Update user role in Firestore
    await db.collection('users').doc(userId).update({
      role: newRole,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Update custom claims in Firebase Auth
    await auth.setCustomUserClaims(userId, { role: newRole });

    return { success: true, message: 'User role updated successfully' };
  } catch (error) {
    console.error('Error updating user role:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Error updating user role'
    );
  }
});

// Cloud Function to get all users (admin only)
export const getAllUsers = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
  }

  try {
    // Check if the requesting user is an admin
    const requesterDoc = await db.collection('users').doc(context.auth.uid).get();
    const requesterData = requesterDoc.data();

    if (!requesterData || requesterData.role !== 'admin') {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Only admins can view all users'
      );
    }

    // Get all users from Firestore
    const usersSnapshot = await db.collection('users').get();
    const users = usersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return { users };
  } catch (error) {
    console.error('Error getting users:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Error getting users'
    );
  }
});

// Cloud Function to handle user creation
export const onCreateUser = functions.auth.user().onCreate(async (user) => {
  try {
    // Set default role for new users
    const defaultRole = 'beneficiary';

    // Create user document in Firestore
    await db.collection('users').doc(user.uid).set({
      email: user.email,
      name: user.displayName || '',
      role: defaultRole,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Set custom claims
    await auth.setCustomUserClaims(user.uid, { role: defaultRole });

    console.log(`New user created with ID: ${user.uid}`);
  } catch (error) {
    console.error('Error creating user document:', error);
  }
}); 