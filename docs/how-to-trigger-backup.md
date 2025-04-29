# Triggering Deducto PWA Backup from an External Application

This document explains how an external application, such as a dashboard or launchpad, can trigger the backup command within the Deducto Progressive Web App (PWA) using `window.postMessage`.

## How Deducto PWA is Launched/Accessed

The external application needs to have a reference to the Deducto PWA's window object to send messages to it. This can be achieved by:

1.  **Opening in a New Window:** The external app can open the Deducto PWA in a new browser window using `window.open()`. The `window.open()` method returns a reference to the new window's window object.

    ```javascript
    const deductoWindow = window.open(
      "https://your-deducto-pwa-url.com",
      "_blank"
    );
    ```

2.  **Embedding in an Iframe:** The external app can embed the Deducto PWA within an iframe. The content window of the iframe provides the necessary window object reference.

    ```html
    <iframe id="deducto-iframe" src="https://your-deducto-pwa-url.com"></iframe>
    <script>
      const deductoIframe = document.getElementById("deducto-iframe");
      const deductoWindow = deductoIframe.contentWindow;
    </script>
    ```

In both cases, `deductoWindow` will be the target window for sending messages.

## Sending the Backup Command

Once the external application has a reference to the Deducto PWA's window object (`deductoWindow`), it can send the "backup" command using the `postMessage` method.

The `postMessage` method takes two required arguments:

1.  `message`: The data to send. In this case, the string `"backup"`.
2.  `targetOrigin`: The origin of the target window. This is crucial for security to ensure the message is only sent to the expected origin.

```javascript
const deductoWindow = window.open("https://your-deducto-pwa-url.com", "_blank"); // Or get from iframe

// Ensure the window is loaded before sending the message (optional but recommended)
deductoWindow.onload = () => {
  deductoWindow.postMessage("backup", "https://your-deducto-pwa-url.com");
};

// If sending later, you might need to check if deductoWindow is still valid
if (deductoWindow) {
  deductoWindow.postMessage("backup", "https://your-deducto-pwa-url.com");
}
```

Replace `"https://your-deducto-pwa-url.com"` with the actual origin of your deployed Deducto PWA. For local development, use the appropriate local origin (e.g., `"http://localhost:5173"` if running on Vite's default port).

## Receiving the Response

The Deducto PWA is configured to send a response message `"backup_received"` back to the source window after processing the backup command. The external application needs to set up an event listener to receive this response.

The `message` event listener in the external application will receive an `event` object with the following relevant properties:

- `event.data`: The data sent from the Deducto PWA (in this case, `"backup_received"`).
- `event.origin`: The origin of the window that sent the message. It's important to verify this for security.
- `event.source`: A reference to the window object that sent the message (the Deducto PWA window).

```javascript
window.addEventListener("message", (event) => {
  // Verify the origin of the message for security
  if (event.origin === "https://your-deducto-pwa-url.com") {
    if (event.data === "backup_received") {
      console.log(
        "Backup command successfully received and processed by Deducto PWA."
      );
      // Perform any necessary actions in the external app after successful backup
    }
  } else {
    console.warn("Received message from unauthorized origin:", event.origin);
  }
});
```

Again, replace `"https://your-deducto-pwa-url.com"` with the actual origin of your Deducto PWA.

By implementing these steps, an external application can effectively communicate with the Deducto PWA to trigger the backup functionality and receive confirmation.
