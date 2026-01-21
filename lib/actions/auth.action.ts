'use server';

import { auth, db } from "@/app/(root)/firebase/admin";
import { cookies } from "next/headers";

const ONE_WEEK = 7 * 24 * 60 * 60;

export async function signUp(params: SignUpParams) {
    const { uid, name, email, password } = params;

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return {
            success: false,
            message: 'Please enter a valid email address.'
        };
    }

    if (!name || name.trim().length < 2) {
        return {
            success: false,
            message: 'Name must be at least 2 characters long.'
        };
    }

    if (!password || password.length < 6) {
        return {
            success: false,
            message: 'Password must be at least 6 characters long.'
        };
    }

    try {
        // Check if user already exists in Firestore
        const userRecord = await db.collection('users').doc(uid).get();
        if (userRecord.exists) {
            return {
                success: false,
                message: 'User already exists. Please sign in instead.'
            };
        }

        // Create user document in Firestore
        await db.collection('users').doc(uid).set({
            uid,
            name: name.trim(),
            email: email.toLowerCase().trim(),
            createdAt: new Date(),
        });
        
        return {
            success: true,
            message: 'Account created successfully! You can now sign in.'
        };
        
    } catch (error: any) {
        console.error('Error creating user profile:', error);
        
        return { 
            success: false,
            message: 'Failed to create account. Please try again.'
        };
    }
}

export async function signIn(params: SignInParams) {
    const { email, idToken } = params;

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return {
            success: false,
            message: 'Please enter a valid email address.'
        };
    }

    if (!idToken) {
        return {
            success: false,
            message: 'Authentication token is required.'
        };
    }

    try {
        // Verify the ID token and get user info
        const decodedToken = await auth.verifyIdToken(idToken);
        const uid = decodedToken.uid;

        // Check if user exists in Firestore
        const userDoc = await db.collection('users').doc(uid).get();
        
        if (!userDoc.exists) {
            return {
                success: false,
                message: 'No account found. Please sign up first.'
            };
        }

        // Create session cookie
        await setSessionCookie(idToken);
        
        return {
            success: true,
            message: 'Signed in successfully!'
        };
    
    } catch (error: any) {
        console.error('Error signing in user:', error);

        if (error.code === 'auth/id-token-expired') {
            return {
                success: false,
                message: 'Session expired. Please try signing in again.'
            };
        }

        if (error.code === 'auth/invalid-id-token') {
            return {
                success: false,
                message: 'Invalid authentication. Please try again.'
            };
        }

        return {
            success: false,
            message: 'Sign in failed. Please check your credentials and try again.'
        };
    }
}

export async function setSessionCookie(idToken: string) {
    try {
        const cookieStore = await cookies();
        const sessionCookie = await auth.createSessionCookie(idToken, {
            expiresIn: 60 * 60 * 24 * 7 * 1000 // 7 days
        });

        cookieStore.set('session', sessionCookie, {
            httpOnly: true,
            maxAge: ONE_WEEK,
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            sameSite: 'lax',
        });
    } catch (error) {
        console.error('Error setting session cookie:', error);
        throw error;
    }
}