import { z } from "zod";
import { privateProcedure, router } from "./trpc";
import { TRPCError } from "@trpc/server";
import { getPayloadClient } from "../get-playload";
import { stripe } from "../lib/stripe";
import type Stripe from "stripe";

export const paymentRouter = router({
  createSession: privateProcedure
    .input(z.object({ productIDs: z.array(z.string()) }))
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx;
      let { productIDs } = input;

      if (productIDs.length === 0) throw new TRPCError({ code: "BAD_REQUEST" });

      const payload = await getPayloadClient();

      const { docs: products } = await payload.find({
        collection: "products",
        where: {
          id: {
            in: productIDs,
          },
        },
      });

      const filteredProducts = products.filter((product) =>
        Boolean(product.priceID)
      );

      const order = await payload.create({
        collection: "orders",
        data: {
          user: user.id,
          _isPaid: false,
          products: filteredProducts.map((product) => product.id),
        },
      });

      const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

      filteredProducts.forEach((product) => {
        line_items.push({
          price: product.priceID!,
          quantity: 1,
        });
      });

      line_items.push({
        price: "price_1Oe0YWF84NR5pGWn3Wsx5wO4",
        quantity: 1,
        adjustable_quantity: {
          enabled: false,
        },
      });

      try {
        const stripeSession = await stripe.checkout.sessions.create({
          success_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/thank-you?orderID=${order.id}`,
          cancel_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/cart`,
          payment_method_types: ["card", "boleto"],
          mode: "payment",
          metadata: {
            userID: user.id,
            orderID: order.id,
          },
          line_items,
        });

        return { url: stripeSession.url };
      } catch (err) {
        console.log(err);

        return { url: null };
      }
    }),
  pollOrderStatus: privateProcedure
    .input(z.object({ orderID: z.string() }))
    .query(async ({ input }) => {
      const { orderID } = input;

      const payload = await getPayloadClient();

      const { docs: orders } = await payload.find({
        collection: "orders",
        where: {
          id: {
            equals: orderID,
          },
        },
      });

      if (!orders.length) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const [order] = orders;

      return { isPaid: order._isPaid };
    }),
});
