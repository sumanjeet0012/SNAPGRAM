import { INewUser } from "@/types" // custom data type for new user.
import { ID, Query } from "appwrite";
import { account,appwriteConfig,avatars, databases } from "./config"; //These are features of appwrite that we will use in this file. 

// It is a function that creates a new user account on appwrite.
export async function createUserAccount(user: INewUser) {
    try {
        const newAccount = await account.create(ID.unique(), user.email, user.password, user.name)
        // A new account is created and stored in the newAccount variable.
        // The details are stored in Auth of appwrite.

        if(!newAccount) throw new Error("Account not created")

        const avatarUrl = avatars.getInitials(user.name)
        // The avatarUrl is created using the predefined getInitials function of appwrite.
        const newUser = await saveUserToDB({
            accountId: newAccount.$id,
            email: newAccount.email,
            name: newAccount.name,
            imageUrl: avatarUrl,
            username: user.username
        })
        // The new user is saved to the database using the saveUserToDB function.
        return newUser;
    } catch (error) {
        console.log(error)
        return error
    }
}

export async function saveUserToDB(user: {accountId: string;
    email: string;
    name: string;
    imageUrl: URL;
    username?: string;}) {
        try {
            const newUser = await databases.createDocument(
                appwriteConfig.databaseId,
                appwriteConfig.userCollectionId,
                ID.unique(),
                user,
            )
            return newUser;
        } catch (error) {
            console.log(error);
        }
}

// This saveUserToDB function expects a user object as an argument in the specified format and returns a promise.
// The createDocument is a predefined function of appwrite that creates a new document in the specified collection of the database.
//Here ID is document ID, which is unique for each document and the user is the data of the user.

export async function signInAccount(user: {
    email: string;
    password: string;
  }) {
    try {
        const session = await account.createEmailSession(user.email, user.password)
        
        // The session represents the logged in state of a user. It contains authentication credentials like a JWT token that can be used to identify and authorize the user for subsequent requests.
        // The createEmailSession method of the account service handles the authentication and generates this session object. It likely checks the provided email/password against some user data source.

        if(!session) throw new Error("Session not created")
        return session;
    } catch (error) {
        console.log(error)
        return error
    }
}


export async function getCurrentUser() {
    try {
      const currentAccount = await account.get();
  
      if (!currentAccount) throw Error;
  
      const currentUser = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.userCollectionId,
        [Query.equal("accountId", currentAccount.$id)]
      );
  
      if (!currentUser) throw Error;
  
      return currentUser.documents[0];
    } catch (error) {
      console.log(error);
      return null;
    }
  }

export async function signOutAccount() {
    try {
        const session = await account.deleteSession("current")

        return session;
    } catch (error) {
        console.log(error);
    }
}