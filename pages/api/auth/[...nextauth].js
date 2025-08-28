import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';

// This should be replaced with a proper database in production
const users = [
  {
    id: 1,
    name: 'Super Admin',
    email: 'admin@example.com',
    password: '$2a$10$XFDq3wZ2tZIRpGY5Zk5uEeM/4XK9X9Xq9zJ9X9X9X9X9X9X9X9X9X', // password: admin123
    role: 'superadmin',
  },
  {
    id: 2,
    name: 'Regular User',
    email: 'user@example.com',
    password: '$2a$10$XFDq3wZ2tZIRpGY5Zk5uEeM/4XK9X9Xq9zJ9X9X9X9X9X9X9X9X9X', // password: user123
    role: 'user',
  },
];

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Find user by email
        const user = users.find(user => user.email === credentials.email);
        
        if (!user) {
          throw new Error('No user found with this email');
        }

        // Verify password
        const isValid = await compare(credentials.password, user.password);
        
        if (!isValid) {
          throw new Error('Invalid password');
        }

        // Return user data without the password
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      }
    })
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      // Initial sign in
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      // Add role to the session
      if (token) {
        session.user.role = token.role;
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
  },
});
