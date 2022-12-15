import shopify from "../../../utils/initialize-context";
import { AuthQuery, CookieNotFound, gdprTopics, InvalidOAuthError, Session, InvalidSession } from "@shopify/shopify-api";
import { NextApiRequest, NextApiResponse } from "next";
import redirectToAuth from "../../../helpers/redirect-to-auth";
import { storeSession } from "../../../utils/session-storage";

const Callback = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const callbackResponse = await shopify.auth.callback<Session>({
      rawRequest: req,
      rawResponse: res,
    });

    const { session } = callbackResponse;

    if (!session || !session.accessToken) {
      return res.status(403).send("Could not validate auth callback");
    }

    await storeSession(session);

    const responses = await shopify.webhooks.register({ session });

    console.log('responses', responses);

    Object.entries(responses).map(([topic, results]) => {
      // The response from registerAll will include errors for the GDPR topics.  These can be safely ignored.
      // To register the GDPR topics, please set the appropriate webhook endpoint in the
      // 'GDPR mandatory webhooks' section of 'App setup' in the Partners Dashboard.
      for (const result of results) {
        if (!result.success && !gdprTopics.includes(topic)) {
          console.log(
            `Failed to register ${topic} webhook: ${result}`
          );
        }
      }
    });

    // If billing is required, check if the store needs to be charged right away to minimize the number of redirects.
    // TODO: Add billing
    // if (billing && billing.required && billing.options) {
    //   const [hasPayment, confirmationUrl] = await ensureBilling(
    //     session,
    //     billing.options
    //   );

    //   if (!hasPayment) {
    //     return res.redirect(confirmationUrl);
    //   }
    // }

    const host = shopify.utils.sanitizeHost(req.query.host as string);
    if (!host) {
      return res.status(400).send("Missing host parameter");
    }

    let redirectUrl = `/?shop=${session.shop}&host=${encodeURIComponent(host)}`;
    if (shopify.config.isEmbeddedApp) {
      redirectUrl = await shopify.auth.getEmbeddedAppUrl({
        rawRequest: req,
        rawResponse: res,
      });
    }
    res.redirect(redirectUrl);
  } catch (e: any) {
    console.warn(e);
    switch (true) {
      case e instanceof InvalidOAuthError:
        res.status(400);
        res.send(e.message);
        break;
      case e instanceof CookieNotFound:
      case e instanceof InvalidSession:
        // This is likely because the OAuth session cookie expired before the merchant approved the request
        return redirectToAuth(req, res);
        break;
      default:
        res.status(500);
        res.send(e.message);
        break;
    }
  }
}

export default Callback;