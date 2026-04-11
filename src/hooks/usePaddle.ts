"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface PaddleEvent {
  name: string;
  data?: { transaction_id?: string };
}

declare global {
  interface Window {
    Paddle?: {
      Initialize: (opts: { token: string; eventCallback?: (e: PaddleEvent) => void }) => void;
      Checkout: {
        open: (opts: {
          items: { priceId: string; quantity: number }[];
          customer?: { email: string };
          customData?: Record<string, string>;
        }) => void;
      };
    };
  }
}

export function usePaddle() {
  const router = useRouter();
  // Keep router ref stable so the eventCallback closure never goes stale
  const routerRef = useRef(router);
  routerRef.current = router;

  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;

    function initPaddle() {
      if (!window.Paddle || initializedRef.current) return;
      initializedRef.current = true;
      window.Paddle.Initialize({
        token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN!,
        eventCallback(data: PaddleEvent) {
          if (data.name === "checkout.completed") {
            const txId = data.data?.transaction_id;
            if (txId) {
              sessionStorage.setItem("pp_transaction_id", txId);
              routerRef.current.push("/dashboard/projects/payment-success");
            }
          }
        },
      });
    }

    if (window.Paddle) {
      initPaddle();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
    script.async = true;
    script.onload = initPaddle;
    document.head.appendChild(script);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function openCheckout(address: string, email?: string) {
    if (!window.Paddle) return;
    window.Paddle.Checkout.open({
      items: [{ priceId: process.env.NEXT_PUBLIC_PADDLE_PRICE_ID!, quantity: 1 }],
      ...(email ? { customer: { email } } : {}),
      customData: { address },
    });
  }

  return { openCheckout };
}
