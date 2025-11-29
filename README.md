# Shelly Stock Price Monitor

Shelly script to monitor Stock prices as virtual components. It turns your Shelly Gen2 device into a stock price monitor. It creates virtual components on the device's UI to display the current price of a stock symbol (e.g., "SLYG.DE") and updates it every minute.

**Data Source:** Yahoo Finance API (unofficial)

## Scripts

1.  **`setup_virtual_components.js`**
    *   **Purpose:** Automatically creates the necessary virtual components (Group, Text fields, Number field) on your Shelly device.
    *   **Usage:** Run this script ONCE to set up the UI. It will print the component IDs you need for the main script.

2.  **`stock-price.js`**
    *   **Purpose:** The main logic. It fetches the stock price from Yahoo Finance and updates the virtual components.
    *   **Usage:** This script runs continuously (via a timer).

## Setup Instructions

1.  **Open Shelly Web Interface:** Go to your device's IP address in a browser.
2.  **Go to Scripts:** Click on "Scripts" in the menu.
3.  **Create Setup Script:**
    *   Create a new script, name it `Setup`.
    *   Copy the content of `setup_virtual_components.js` into it.
    *   **Run the script.**
    *   Look at the **Console Output**. It will print a block of code like this:
        ```javascript
        symbol_id: "text:200",
        price_id: "number:200",
        time_id: "text:201",
        ```
    *   **Copy these lines.**
    *   Stop the `Setup` script (it stops itself automatically upon completion).

4.  **Create Main Script:**
    *   Create a new script, name it `StockMonitor`.
    *   Copy the content of `stock-price.js` into it.
    *   **Paste the IDs** you copied in step 3 into the `CONFIG` section at the top of the file:
        ```javascript
        let CONFIG = {
          symbol_id:       "text:200", // <-- PASTE HERE
          price_id:        "number:200", // <-- PASTE HERE
          last_updated_id: "text:201"  // <-- PASTE HERE
        };
        ```
    *   **Save and Run.**
    *   Enable "Run on startup" if you want it to persist after reboot.

## Customization

*   **Change Stock Symbol:** You can change the default stock symbol in the `stock-price.js` script (`DEFAULT_SYMBOL`) or by editing the "Stock Symbol" text component directly in the Shelly Web UI.
*   **Update Interval:** The default update interval is 1 minute. You can change `Timer.set(60 * 1000, ...)` at the bottom of `stock-price.js`.

## Useful Ideas

*   **Shelly Smart Control App:** Once the virtual components are created, you can view the stock price as a Virtual Device directly in the Shelly Smart Control app (https://control.shelly.cloud).
*   **Automation:** Use the price monitor for automation! You can create scenes in the Shelly app or write local scripts to trigger actions based on the price. For example, turn a light **GREEN** when the price goes up faster!
*   **Statistics:** Since the data is stored in a Virtual Component, Shelly Smart Control automatically tracks the history. You can view charts and statistics of the stock price over time directly in the app.
*   **Integration:** The values are exposed via the Shelly API/RPC. You can easily fetch the current price from other local devices (like an e-ink display or another microcontroller) by polling the virtual component's status.

