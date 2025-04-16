import { doc, getDoc } from "firebase/firestore";
import { db } from "../config/firebase";

interface AppConfig {
  appName: string;
  logoUrl: string;
}

// Default app configuration
const DEFAULT_APP_NAME = "NeRo Digital Printing";
const DEFAULT_LOGO_URL = "/assets/images/icon.png";

// Get app configuration from Firestore
export const getAppConfig = async (): Promise<AppConfig> => {
  try {
    const docRef = doc(db, "appConfig", "settings");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data() as AppConfig;
      return {
        appName: data.appName || DEFAULT_APP_NAME,
        logoUrl: data.logoUrl || DEFAULT_LOGO_URL,
      };
    }

    // Return defaults if no config exists
    return {
      appName: DEFAULT_APP_NAME,
      logoUrl: DEFAULT_LOGO_URL,
    };
  } catch (error) {
    console.error("Error fetching app config:", error);
    // Return defaults on error
    return {
      appName: DEFAULT_APP_NAME,
      logoUrl: DEFAULT_LOGO_URL,
    };
  }
};

// Default export for Expo Router
export default function AppConfig() {
  return null;
}
