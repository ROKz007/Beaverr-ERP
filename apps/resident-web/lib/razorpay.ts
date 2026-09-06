declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

let scriptPromise: Promise<void> | null = null;

function loadCheckoutScript(): Promise<void> {
  if (window.Razorpay) return Promise.resolve();
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load Razorpay checkout script."));
      document.body.appendChild(script);
    });
  }
  return scriptPromise;
}

export async function openRazorpayCheckout(options: {
  keyId: string;
  orderId: string;
  amount: number;
  name: string;
  onSuccess: () => void;
}) {
  await loadCheckoutScript();
  const razorpay = new window.Razorpay({
    key: options.keyId,
    order_id: options.orderId,
    amount: Math.round(options.amount * 100),
    currency: "INR",
    name: "Beaverr",
    description: options.name,
    // Authoritative status only ever comes from the webhook — this just gives the user
    // immediate feedback and triggers a refetch.
    handler: options.onSuccess,
  });
  razorpay.open();
}
