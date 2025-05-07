import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin
admin.initializeApp();

const db = admin.firestore();
const auth = admin.auth();

// Define valid roles
const VALID_ROLES = ['admin', 'staff', 'donor', 'beneficiary', 'volunteer'] as const;

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
export const getAllUsers = functions.https.onRequest(async (req, res) => {
  // Handle CORS preflight
  res.set('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.set('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }
  try {
    // Get the authorization token from the request header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Unauthorized: No token provided' });
      return;
    }

    const token = authHeader.split('Bearer ')[1];
    // Verify the token
    const decodedToken = await auth.verifyIdToken(token);
    const uid = decodedToken.uid;

    // Check if the requesting user is an admin
    const requesterDoc = await db.collection('users').doc(uid).get();
    const requesterData = requesterDoc.data();

    if (!requesterData || requesterData.role !== 'admin') {
      res.status(403).json({ error: 'Forbidden: Only admins can view all users' });
      return;
    }

    // Get all users from Firestore
    const usersSnapshot = await db.collection('users').get();
    const users = usersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.status(200).json({ users });
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ error: 'Internal server error' });
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