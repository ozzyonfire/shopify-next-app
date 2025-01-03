"use client";
import { useAppBridge } from "@shopify/app-bridge-react";
import { useEffect } from "react";
import { doWebhookRegistration, storeToken } from "../actions";

export default function SessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const app = useAppBridge();

  useEffect(() => {
    app.idToken().then((token) => {
      storeToken(token)
        .then(() => {
          console.log("Token stored");
        })
        .catch((error) => {
          console.error("Error storing token", error);
        });
      doWebhookRegistration(token)
        .then(() => {
          console.log("Webhook registered");
        })
        .catch((error) => {
          console.error("Error registering webhook", error);
        });
    });
  }, [app]);

  return <>{children}</>;
}
