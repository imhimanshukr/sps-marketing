import connectDB from "@/lib/db";
import User from "@/models/user.model";
import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";

// NextAuth main config
/* Authorize → JWT me data → Session me data → FE useSession() se access */
export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  // 🔐 Login providers
  providers: [
    Credentials({
      // Login form ke fields
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      // 🔍 Login ke time user verify hota hai
      async authorize(credentials) {
        try {
          // Agar credentials na mile to login fail
          if (!credentials) return null;

          // Database connect
          await connectDB();

          const { email, password } = credentials;

          // Email se user dhundhna
          const existUser = await User.findOne({ email });
          if (!existUser) {
            throw new Error("User does not exist");
          }

          // Password match check
          const isMatch = await bcrypt.compare(
            password as string,
            existUser.password
          );

          if (!isMatch) {
            throw new Error("Incorrect password");
          }

          // ✅ Login success hone par user data return
          return {
            id: existUser._id.toString(), // id string hona zaroori hai
            name: existUser.name,
            email: existUser.email,
          };
        } catch (error) {
          // Error aane par login fail
          console.log(error);
          return null;
        }
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],

  // 🔄 Callbacks: token aur session control karte hain
  callbacks: {
    // 🪙 JWT: user data ko token ke andar dalta hai (backend use)
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
      }
      return token;
    },

    // 👤 Session: token se data nikal ke session me dalta hai (frontend use)
    // Token backend authentication ke liye hota hai, jabki session frontend ke liye hota hai, isliye token ka required data session me store kiya jata hai jise useSession() se access krte h.
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
      }
      return session;
    },
    async signIn({ user, account }) {
      console.log("useruser: ", { user, account });
      if (account?.provider === "google") {
        await connectDB();
        let dbUser = await User.findOne({ email: user.email });
        if (!dbUser) {
          dbUser = await User.create({
            name: user.name,
            email: user.email,
            image: user.image,
          });
        }
        user.id = dbUser?._id.toString();
      }
      return true;
    },
  },

  // 📄 Custom pages
  pages: {
    signIn: "/login", // Login page
    error: "/login", // Error page
  },

  // ⏳ Session settings
  session: {
    strategy: "jwt", // JWT based session
    maxAge: 10 * 24 * 60 * 60 * 1000, // 10 din tak session valid
  },

  // 🔑 Secret key
  secret: process.env.NEXTAUTH_SECRET,
});
