import { useEffect, useState } from 'react';
import { Account, Client, Models } from 'appwrite';

interface User extends Models.User<Models.Preferences> {
    role?: string;
}

const client = new Client()
    .setEndpoint('https://fra.cloud.appwrite.io/v1')
    .setProject('68ac2652001ca468e987');

const account = new Account(client);

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const session = await account.getSession('current');
            if (session) {
                const user = await account.get();
                setUser(user);
            }
        } catch (error) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        try {
            await account.createEmailSession(email, password);
            await checkAuth();
        } catch (error) {
            throw error;
        }
    };

    const logout = async () => {
        try {
            await account.deleteSession('current');
            setUser(null);
        } catch (error) {
            throw error;
        }
    };

    const register = async (email: string, password: string, name: string) => {
        try {
            await account.create('unique()', email, password, name);
            await login(email, password);
        } catch (error) {
            throw error;
        }
    };

    return {
        user,
        loading,
        login,
        logout,
        register,
        checkAuth,
    };
}
